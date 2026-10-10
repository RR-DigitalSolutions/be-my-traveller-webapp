// ============================================================
// TaskService
// Core service managing operational task lifecycles,
// assignments, state machine transitions, and audit records.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import {
  TaskModel,
  type ITask,
  type TaskType,
  type TaskPriority,
  type TaskEntityType,
} from "./task.model";
import { TaskStateMachine, type TaskStatus } from "@/domains/workflow/state-machine";
import { AuditService } from "@/domains/auth/audit.service";
import type { DepartmentKey } from "@/lib/auth/permissions";
import mongoose from "mongoose";

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  priority?: TaskPriority;
  entityType?: TaskEntityType;
  entityId?: string;
  entityRef?: string;
  assignedTo?: string;
  assignedBy?: string;
  department?: DepartmentKey;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
  creatorEmail?: string;
}

export interface TaskFilterOptions {
  assignedTo?: string;
  department?: DepartmentKey;
  status?: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
  entityType?: TaskEntityType;
  entityId?: string;
  page?: number;
  limit?: number;
}

export class TaskService {
  /**
   * Create a new operational task.
   */
  static async createTask(input: CreateTaskInput): Promise<ITask> {
    await connectDB();

    const task = await TaskModel.create({
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority || "MEDIUM",
      status: "PENDING",
      entityType: input.entityType || "General",
      entityId: input.entityId && mongoose.Types.ObjectId.isValid(input.entityId) ? new mongoose.Types.ObjectId(input.entityId) : undefined,
      entityRef: input.entityRef,
      assignedTo: input.assignedTo && mongoose.Types.ObjectId.isValid(input.assignedTo) ? new mongoose.Types.ObjectId(input.assignedTo) : undefined,
      assignedBy: input.assignedBy && mongoose.Types.ObjectId.isValid(input.assignedBy) ? new mongoose.Types.ObjectId(input.assignedBy) : undefined,
      department: input.department,
      dueDate: input.dueDate,
      metadata: input.metadata,
    });

    if (input.assignedBy && input.creatorEmail) {
      await AuditService.logTask({
        userId: input.assignedBy,
        userEmail: input.creatorEmail,
        action: "TASK_CREATE",
        taskId: task._id.toString(),
        newValue: {
          title: task.title,
          type: task.type,
          priority: task.priority,
          assignedTo: input.assignedTo,
        },
      });
    }

    return task;
  }

  /**
   * Transition task status safely using TaskStateMachine.
   */
  static async updateTaskStatus(params: {
    taskId: string;
    targetStatus: TaskStatus;
    userId: string;
    userEmail: string;
    reason?: string;
  }): Promise<ITask> {
    await connectDB();

    const task = await TaskModel.findById(params.taskId);
    if (!task) {
      throw new Error(`Task ${params.taskId} not found`);
    }

    const previousStatus = task.status;

    // Execute state machine assertion & audit log
    await TaskStateMachine.executeTransition({
      entityId: task._id.toString(),
      currentState: previousStatus,
      targetState: params.targetStatus,
      trigger: "USER_STATUS_UPDATE",
      context: {
        userId: params.userId,
        userEmail: params.userEmail,
        reason: params.reason,
      },
    });

    task.status = params.targetStatus;
    if (params.targetStatus === "COMPLETED") {
      task.completedAt = new Date();
      task.completedBy = new mongoose.Types.ObjectId(params.userId);
    }

    await task.save();

    await AuditService.logTask({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.targetStatus === "COMPLETED" ? "TASK_COMPLETE" : "TASK_UPDATE",
      taskId: task._id.toString(),
      oldValue: { status: previousStatus },
      newValue: { status: params.targetStatus },
      metadata: { reason: params.reason },
    });

    return task;
  }

  /**
   * Assign or reassign a task to a staff member or department.
   */
  static async assignTask(params: {
    taskId: string;
    assignedTo?: string;
    department?: DepartmentKey;
    assignerId: string;
    assignerEmail: string;
  }): Promise<ITask> {
    await connectDB();

    const task = await TaskModel.findById(params.taskId);
    if (!task) {
      throw new Error(`Task ${params.taskId} not found`);
    }

    const previousAssignedTo = task.assignedTo?.toString();
    const previousDepartment = task.department;

    if (params.assignedTo) {
      task.assignedTo = new mongoose.Types.ObjectId(params.assignedTo);
    }
    if (params.department) {
      task.department = params.department;
    }
    task.assignedBy = new mongoose.Types.ObjectId(params.assignerId);

    await task.save();

    await AuditService.logTask({
      userId: params.assignerId,
      userEmail: params.assignerEmail,
      action: "TASK_ASSIGN",
      taskId: task._id.toString(),
      oldValue: { assignedTo: previousAssignedTo, department: previousDepartment },
      newValue: { assignedTo: params.assignedTo, department: params.department },
    });

    return task;
  }

  /**
   * Add a collaborative internal note to a task.
   */
  static async addNote(taskId: string, content: string, userId: string): Promise<ITask> {
    await connectDB();

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $push: {
          notes: {
            content,
            createdBy: new mongoose.Types.ObjectId(userId),
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return task;
  }

  /**
   * Query tasks with pagination and flexible filters.
   */
  static async getTasks(options: TaskFilterOptions = {}) {
    await connectDB();

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 25));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (options.status) query.status = options.status;
    if (options.type) query.type = options.type;
    if (options.priority) query.priority = options.priority;
    if (options.department) query.department = options.department;
    if (options.assignedTo) {
      query.assignedTo = new mongoose.Types.ObjectId(options.assignedTo);
    }
    if (options.entityType) query.entityType = options.entityType;
    if (options.entityId) {
      query.entityId = new mongoose.Types.ObjectId(options.entityId);
    }

    const [tasks, total] = await Promise.all([
      TaskModel.find(query)
        .populate("assignedTo", "name email role")
        .populate("assignedBy", "name email")
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskModel.countDocuments(query),
    ]);

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
