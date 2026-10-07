// ============================================================
// NotificationService
// Cross-cutting notification dispatch service for staff & teams.
// Handles in-app alerts, department broadcasts, and read tracking.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import {
  NotificationModel,
  type INotification,
  type NotificationType,
} from "./notification.model";
import type { DepartmentKey, RoleKey } from "@/lib/auth/permissions";
import mongoose from "mongoose";

export interface SendNotificationInput {
  recipientId?: string;
  department?: DepartmentKey;
  role?: RoleKey;
  type?: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Dispatch a notification to a specific user, department, or role.
   */
  static async send(input: SendNotificationInput): Promise<INotification> {
    await connectDB();

    const doc = await NotificationModel.create({
      recipient: input.recipientId ? new mongoose.Types.ObjectId(input.recipientId) : undefined,
      targetDepartment: input.department,
      targetRole: input.role,
      type: input.type || "INFO",
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
      isRead: false,
    });

    return doc;
  }

  /**
   * Send an instant alert to an individual staff member.
   */
  static async notifyUser(
    recipientId: string,
    title: string,
    message: string,
    options?: { type?: NotificationType; link?: string; metadata?: Record<string, unknown> }
  ): Promise<INotification> {
    return this.send({
      recipientId,
      title,
      message,
      type: options?.type || "INFO",
      link: options?.link,
      metadata: options?.metadata,
    });
  }

  /**
   * Broadcast an alert to an entire operational department (e.g. OPERATIONS, SALES, FINANCE).
   */
  static async notifyDepartment(
    department: DepartmentKey,
    title: string,
    message: string,
    options?: { type?: NotificationType; link?: string }
  ): Promise<INotification> {
    return this.send({
      department,
      title,
      message,
      type: options?.type || "INFO",
      link: options?.link,
    });
  }

  /**
   * Fetch unread and recent notifications for a user, including department broadcasts.
   */
  static async getUserNotifications(params: {
    userId: string;
    department?: DepartmentKey;
    unreadOnly?: boolean;
    limit?: number;
  }) {
    await connectDB();

    const query: Record<string, unknown> = {
      $or: [
        { recipient: new mongoose.Types.ObjectId(params.userId) },
        ...(params.department ? [{ targetDepartment: params.department }] : []),
      ],
    };

    if (params.unreadOnly) {
      query.isRead = false;
    }

    const limit = Math.min(100, Math.max(1, params.limit || 20));

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({
      ...query,
      isRead: false,
    });

    return { notifications, unreadCount };
  }

  /**
   * Mark a notification as read.
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await connectDB();
    await NotificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  /**
   * Mark all notifications for a user as read.
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await connectDB();
    await NotificationModel.updateMany(
      { recipient: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
}
