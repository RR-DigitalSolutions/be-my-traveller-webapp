// ============================================================
// Typed Application Error Classes
// Thrown by services/actions, caught by API route error handler.
// ============================================================

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTH_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422, "BUSINESS_RULE_ERROR");
    this.name = "BusinessRuleError";
  }
}

// ── API Response Helpers ──────────────────────────────────────

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return NextResponse.json({ success: true, data, ...(meta && { meta }) }, { status });
}

export function apiError(error: unknown) {
  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV !== "production" && error.details
            ? { details: error.details }
            : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Unknown error — do not expose stack trace
  console.error("[API Error]", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again.",
      },
    },
    { status: 500 }
  );
}
