// ============================================================
// Workflow / State-Machine Foundation
// Enterprise lifecycle transition engine for Be My Traveller.
// Strictly guards legal state changes, executes hooks, and
// automatically produces auditable transition event records.
// ============================================================

import { AuditService } from "@/domains/auth/audit.service";
import type { LeadStatus } from "@/domains/crm/lead.model";
import type { QuoteStatus } from "@/domains/booking/quote.model";
import type { BookingStatus } from "@/domains/booking/booking.model";

export class InvalidStateTransitionError extends Error {
  readonly code = "INVALID_STATE_TRANSITION";
  readonly fromState: string;
  readonly toState: string;
  readonly entityType: string;

  constructor(entityType: string, fromState: string, toState: string, reason?: string) {
    super(
      `Cannot transition ${entityType} from "${fromState}" to "${toState}"${
        reason ? `: ${reason}` : "."
      }`
    );
    this.name = "InvalidStateTransitionError";
    this.entityType = entityType;
    this.fromState = fromState;
    this.toState = toState;
  }
}

export interface TransitionContext {
  userId: string;
  userEmail: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export interface StateMachineDefinition<TState extends string> {
  entityType: string;
  initialState: TState;
  allowedTransitions: Record<TState, readonly TState[]>;
  terminalStates: readonly TState[];
}

export class StateMachine<TState extends string> {
  readonly entityType: string;
  readonly allowedTransitions: Record<TState, readonly TState[]>;
  readonly terminalStates: readonly TState[];

  constructor(definition: StateMachineDefinition<TState>) {
    this.entityType = definition.entityType;
    this.allowedTransitions = definition.allowedTransitions;
    this.terminalStates = definition.terminalStates;
  }

  /**
   * Checks whether a proposed transition is valid from the current state.
   */
  canTransition(currentState: TState, targetState: TState): boolean {
    if (currentState === targetState) return true; // Idempotent no-op
    const allowed = this.allowedTransitions[currentState];
    return Array.isArray(allowed) && allowed.includes(targetState);
  }

  /**
   * Asserts transition legality; throws InvalidStateTransitionError if illegal.
   */
  assertTransition(currentState: TState, targetState: TState): void {
    if (!this.canTransition(currentState, targetState)) {
      throw new InvalidStateTransitionError(this.entityType, currentState, targetState);
    }
  }

  /**
   * Executes a verified transition and emits an append-only audit event.
   */
  async executeTransition(params: {
    entityId: string;
    entitySlug?: string;
    currentState: TState;
    targetState: TState;
    trigger: string;
    context: TransitionContext;
  }): Promise<{ from: TState; to: TState }> {
    this.assertTransition(params.currentState, params.targetState);

    // If already in target state, return without redundant logging
    if (params.currentState === params.targetState) {
      return { from: params.currentState, to: params.targetState };
    }

    // Log the formal transition event into audit log
    await AuditService.logTransition({
      userId: params.context.userId,
      userEmail: params.context.userEmail,
      entityType: this.entityType,
      entityId: params.entityId,
      entitySlug: params.entitySlug,
      fromState: params.currentState,
      toState: params.targetState,
      trigger: params.trigger,
      metadata: {
        reason: params.context.reason,
        ...params.context.metadata,
      },
      ip: params.context.ip,
      userAgent: params.context.userAgent,
    });

    return { from: params.currentState, to: params.targetState };
  }
}

// ============================================================
// 1. Lead Lifecycle State Machine
// ============================================================
export const LEAD_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ["CONTACTED", "CONNECTED", "FOLLOW_UP", "QUALIFIED", "LOST"],
  CONTACTED: ["CONNECTED", "FOLLOW_UP", "QUALIFIED", "LOST"],
  CONNECTED: ["FOLLOW_UP", "QUALIFIED", "QUOTE_SENT", "LOST"],
  FOLLOW_UP: ["CONNECTED", "QUALIFIED", "QUOTE_SENT", "LOST"],
  QUALIFIED: ["QUOTE_SENT", "NEGOTIATION", "PAYMENT_PENDING", "CONFIRMED", "LOST"],
  QUOTE_SENT: ["FOLLOW_UP", "NEGOTIATION", "PAYMENT_PENDING", "CONFIRMED", "LOST"],
  NEGOTIATION: ["QUOTE_SENT", "PAYMENT_PENDING", "CONFIRMED", "LOST"],
  PAYMENT_PENDING: ["CONFIRMED", "BOOKED", "LOST"],
  CONFIRMED: ["BOOKED", "TRAVEL_COMPLETED", "LOST"],
  BOOKED: ["TRAVEL_COMPLETED", "LOST"],
  TRAVEL_COMPLETED: [],
  LOST: ["NEW", "CONTACTED", "FOLLOW_UP"], // Allows reactivation of previously lost leads
};

export const LeadStateMachine = new StateMachine<LeadStatus>({
  entityType: "Lead",
  initialState: "NEW",
  allowedTransitions: LEAD_TRANSITIONS,
  terminalStates: ["TRAVEL_COMPLETED"],
});

// ============================================================
// 2. Quote Lifecycle State Machine
// ============================================================
export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  DRAFT: ["SENT", "REJECTED", "EXPIRED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "DRAFT"],
  VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED", "DRAFT"],
  ACCEPTED: ["CONVERTED", "REJECTED"],
  REJECTED: ["DRAFT"], // Allows revising a rejected quote
  EXPIRED: ["DRAFT"],  // Allows cloning/renewing an expired quote
  CONVERTED: [],       // Terminal state once converted to Booking
};

export const QuoteStateMachine = new StateMachine<QuoteStatus>({
  entityType: "Quote",
  initialState: "DRAFT",
  allowedTransitions: QUOTE_TRANSITIONS,
  terminalStates: ["CONVERTED"],
});

// ============================================================
// 3. Booking Lifecycle State Machine
// ============================================================
export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING_PAYMENT: ["PARTIALLY_PAID", "CONFIRMED", "CANCELLED"],
  PARTIALLY_PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
};

export const BookingStateMachine = new StateMachine<BookingStatus>({
  entityType: "Booking",
  initialState: "PENDING_PAYMENT",
  allowedTransitions: BOOKING_TRANSITIONS,
  terminalStates: ["COMPLETED", "REFUNDED"],
});

// ============================================================
// 4. Task Lifecycle State Machine
// ============================================================
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "CANCELLED";

export const TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  PENDING: ["IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "BLOCKED", "CANCELLED", "PENDING"],
  BLOCKED: ["PENDING", "IN_PROGRESS", "CANCELLED"],
  COMPLETED: ["IN_PROGRESS"], // Re-opened if needed
  CANCELLED: ["PENDING"],     // Re-activated if needed
};

export const TaskStateMachine = new StateMachine<TaskStatus>({
  entityType: "Task",
  initialState: "PENDING",
  allowedTransitions: TASK_TRANSITIONS,
  terminalStates: ["COMPLETED", "CANCELLED"],
});

// ============================================================
// 5. Supplier Payment Approval State Machine
// ============================================================
export type SupplierPaymentState = "PENDING_APPROVAL" | "APPROVED" | "PAID" | "REJECTED";

export const SUPPLIER_PAYMENT_TRANSITIONS: Record<SupplierPaymentState, readonly SupplierPaymentState[]> = {
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID", "REJECTED"],
  PAID: [],
  REJECTED: ["PENDING_APPROVAL"],
};

export const SupplierPaymentStateMachine = new StateMachine<SupplierPaymentState>({
  entityType: "SupplierPayment",
  initialState: "PENDING_APPROVAL",
  allowedTransitions: SUPPLIER_PAYMENT_TRANSITIONS,
  terminalStates: ["PAID"],
});

