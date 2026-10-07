// ============================================================
// Architecture Foundation Verification Test Suite
// ============================================================

import fs from "fs";
import path from "path";

// Auto-load .env or .env.local if present
try {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  const envDefault = path.resolve(process.cwd(), ".env");
  const targetEnv = fs.existsSync(envLocal) ? envLocal : fs.existsSync(envDefault) ? envDefault : null;
  if (targetEnv && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(targetEnv);
  }
} catch {
  // Ignore env loading error if handled by runtime
}

import connectDB from "@/lib/db/mongoose";
import {
  Role,
  Department,
  Permission,
  hasPermission,
  hasSectionAccess,
  DEPARTMENTS,
} from "@/lib/auth/permissions";
import { AuditService } from "@/domains/auth/audit.service";
import {
  LeadStateMachine,
  QuoteStateMachine,
  BookingStateMachine,
  InvalidStateTransitionError,
} from "@/domains/workflow/state-machine";
import { TaskModel } from "@/domains/tasks/task.model";
import { TaskService } from "@/domains/tasks/task.service";
import { NotificationModel } from "@/domains/notifications/notification.model";
import { NotificationService } from "@/domains/notifications/notification.service";
import { MigrationRunner } from "@/lib/db/migrations/migration-runner";
import mongoose from "mongoose";

async function runFoundationTests() {
  console.log("============================================================");
  console.log("🚀 STARTING ARCHITECTURE FOUNDATION VERIFICATION SUITE");
  console.log("============================================================\n");

  await connectDB();
  console.log("✅ Database connection established.\n");

  // ── TEST 1: RBAC Foundation & Permission System ───────────
  console.log("--- 1. Testing RBAC Foundation & Permission System ---");
  const superAdminHasAll = hasPermission(Role.SUPER_ADMIN, Permission.SETTINGS_EDIT);
  const salesAgentCannotManageUsers = !hasPermission(Role.SALES_AGENT, Permission.USER_MANAGE);
  const operationsHasHotelManage = hasPermission(Role.OPERATIONS, Permission.OPERATION_HOTEL_MANAGE);
  const financeHasInvoiceManage = hasPermission(Role.FINANCE, Permission.FINANCE_INVOICE_MANAGE);

  if (!superAdminHasAll || !salesAgentCannotManageUsers || !operationsHasHotelManage || !financeHasInvoiceManage) {
    throw new Error("RBAC permission assertion failed!");
  }
  console.log("✅ RBAC & Permission system assertions verified.\n");

  // ── TEST 2: Department Structure ──────────────────────────
  console.log("--- 2. Testing Department Structure ---");
  if (!DEPARTMENTS.OPERATIONS || !DEPARTMENTS.FINANCE || !DEPARTMENTS.SALES || !DEPARTMENTS.ADMIN) {
    throw new Error("Department configurations missing!");
  }
  const opsHasSection = hasSectionAccess(
    { role: Role.OPERATIONS, department: Department.OPERATIONS },
    "operations"
  );
  const finHasSection = hasSectionAccess(
    { role: Role.FINANCE, department: Department.FINANCE },
    "finance"
  );
  if (!opsHasSection || !finHasSection) {
    throw new Error("Department section accessibility check failed!");
  }
  console.log("✅ Department structures and section access verified.\n");

  // ── TEST 3: Audit Log Foundation ──────────────────────────
  console.log("--- 3. Testing Audit Log Foundation ---");
  const dummyUserId = new mongoose.Types.ObjectId().toString();
  await AuditService.log({
    userId: dummyUserId,
    userEmail: "audit-test@bemytraveller.com",
    action: "STATE_TRANSITION",
    entityType: "TestEntity",
    entityId: "test-001",
    newValue: { status: "ACTIVE" },
  });

  const recentLogs = await AuditService.getForEntity("TestEntity", "test-001");
  if (!recentLogs || recentLogs.length === 0) {
    throw new Error("Audit log record was not retrieved!");
  }
  console.log(`✅ Audit log recorded and retrieved (${recentLogs.length} record(s)).\n`);

  // ── TEST 4: Workflow / State-Machine Foundation ───────────
  console.log("--- 4. Testing State Machine Foundation ---");
  // Test valid transitions
  if (!LeadStateMachine.canTransition("NEW", "CONTACTED")) {
    throw new Error("Lead transition NEW -> CONTACTED should be allowed!");
  }
  if (!QuoteStateMachine.canTransition("DRAFT", "SENT")) {
    throw new Error("Quote transition DRAFT -> SENT should be allowed!");
  }
  if (!BookingStateMachine.canTransition("CONFIRMED", "IN_PROGRESS")) {
    throw new Error("Booking transition CONFIRMED -> IN_PROGRESS should be allowed!");
  }

  // Test illegal transition rejection
  let illegalCaught = false;
  try {
    BookingStateMachine.assertTransition("CANCELLED", "CONFIRMED");
  } catch (err) {
    if (err instanceof InvalidStateTransitionError) {
      illegalCaught = true;
    }
  }
  if (!illegalCaught) {
    throw new Error("State machine failed to block illegal transition CANCELLED -> CONFIRMED!");
  }

  // Test executed transition with audit logging
  const transitionResult = await LeadStateMachine.executeTransition({
    entityId: "lead-test-123",
    currentState: "NEW",
    targetState: "CONTACTED",
    trigger: "SPECIALIST_FIRST_CALL",
    context: {
      userId: dummyUserId,
      userEmail: "specialist@bemytraveller.com",
      reason: "Called client on WhatsApp",
    },
  });
  if (transitionResult.to !== "CONTACTED") {
    throw new Error("State transition execution failed!");
  }
  console.log("✅ State machines enforced legal and blocked illegal transitions.\n");

  // ── TEST 5: Task Foundation ───────────────────────────────
  console.log("--- 5. Testing Task Foundation ---");
  const testTask = await TaskService.createTask({
    title: "Verify Manali Hotel Deluxe Room Block",
    description: "Confirm room vouchers for Booking BMT-BK-2026-901",
    type: "HOTEL_CONFIRMATION",
    priority: "HIGH",
    department: Department.OPERATIONS,
    entityType: "Booking",
    entityRef: "BMT-BK-2026-901",
    assignedBy: dummyUserId,
    creatorEmail: "ops-manager@bemytraveller.com",
    dueDate: new Date(Date.now() + 86400000),
  });

  if (!testTask._id) {
    throw new Error("Task creation failed!");
  }

  // Transition task using StateMachine
  const updatedTask = await TaskService.updateTaskStatus({
    taskId: testTask._id.toString(),
    targetStatus: "IN_PROGRESS",
    userId: dummyUserId,
    userEmail: "ops-exec@bemytraveller.com",
    reason: "Contacted hotel reservation desk",
  });

  if (updatedTask.status !== "IN_PROGRESS") {
    throw new Error("Task status transition failed!");
  }
  console.log(`✅ Task created (${testTask._id}) and transitioned to IN_PROGRESS.\n`);

  // Clean up test task
  await TaskModel.findByIdAndDelete(testTask._id);

  // ── TEST 6: Notification Foundation ───────────────────────
  console.log("--- 6. Testing Notification Foundation ---");
  const testNotification = await NotificationService.notifyDepartment(
    Department.OPERATIONS,
    "New Trip Confirmation Alert",
    "Booking BMT-BK-2026-901 requires immediate fleet allocation.",
    { type: "BOOKING_CONFIRMED" }
  );

  if (!testNotification._id) {
    throw new Error("Notification dispatch failed!");
  }

  const { notifications, unreadCount } = await NotificationService.getUserNotifications({
    userId: dummyUserId,
    department: Department.OPERATIONS,
    unreadOnly: true,
  });

  if (notifications.length === 0 || unreadCount === 0) {
    throw new Error("Failed to retrieve dispatched department notification!");
  }

  await NotificationService.markAsRead(testNotification._id.toString());
  console.log(`✅ Notification dispatched and verified (Unread count: ${unreadCount}).\n`);

  // Clean up test notification
  await NotificationModel.findByIdAndDelete(testNotification._id);

  // ── TEST 7: Database Migration Infrastructure ─────────────
  console.log("--- 7. Testing Database Migration Infrastructure ---");
  const initialStatus = await MigrationRunner.getStatus();
  console.log(`Migration Status: ${initialStatus.appliedCount} applied, ${initialStatus.pendingCount} pending.`);

  const migrationRun = await MigrationRunner.runPending({
    userId: dummyUserId,
    userEmail: "system@bemytraveller.com",
  });

  console.log(`Executed migrations: ${migrationRun.executed.join(", ") || "None (Already up to date)"}`);

  const finalStatus = await MigrationRunner.getStatus();
  if (finalStatus.appliedCount === 0) {
    throw new Error("Migration runner failed to record baseline migration!");
  }
  console.log(`✅ Database migration infrastructure verified (${finalStatus.appliedCount} applied successfully).\n`);

  console.log("============================================================");
  console.log("🎉 ALL 8 ARCHITECTURE FOUNDATIONS VERIFIED SUCCESSFULLY!");
  console.log("============================================================\n");
}

runFoundationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Foundation test suite failed:", err);
    process.exit(1);
  });
