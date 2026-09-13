// ============================================================
// Server-side authorization guards.
// Import and call these in every Server Action and Route Handler
// that requires a permission check.
// ============================================================

import { auth } from "@/lib/auth/auth";
import { hasPermission, type PermissionKey, type RoleKey } from "./permissions";

// Typed error classes — caught by the API error handler
export class AuthenticationError extends Error {
  readonly code = "AUTH_ERROR";
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";
  constructor(message = "You do not have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Retrieves the current session. Throws AuthenticationError if
 * no valid session exists.
 */
export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthenticationError();
  }
  return session;
}

/**
 * Asserts that the current session user has the specified permission.
 * Throws AuthenticationError if not logged in.
 * Throws AuthorizationError if logged in but lacking permission.
 *
 * Usage:
 *   await requirePermission(Permission.PACKAGE_PUBLISH)
 */
export async function requirePermission(permission: PermissionKey) {
  const session = await getRequiredSession();
  const user = session.user;

  const allowed = hasPermission(
    user.role as RoleKey,
    permission,
    (user.permissions as PermissionKey[]) ?? []
  );

  if (!allowed) {
    throw new AuthorizationError(
      `Missing required permission: ${permission}`
    );
  }

  return session;
}

/**
 * Asserts that the current session user has ANY of the given permissions.
 */
export async function requireAnyPermission(permissions: PermissionKey[]) {
  const session = await getRequiredSession();
  const user = session.user;

  const allowed = permissions.some((p) =>
    hasPermission(
      user.role as RoleKey,
      p,
      (user.permissions as PermissionKey[]) ?? []
    )
  );

  if (!allowed) {
    throw new AuthorizationError(
      `Missing required permissions: ${permissions.join(", ")}`
    );
  }

  return session;
}
