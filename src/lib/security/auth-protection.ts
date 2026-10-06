import bcrypt from "bcryptjs";
import { Role } from "@/lib/auth/permissions";

/**
 * Root Administrator Email Constant
 * Case-insensitive normalized root administrator address.
 */
export function getRootAdminEmail(): string {
  return (process.env.BMT_ADMIN_EMAIL || "admin@bemytraveller.com").trim().toLowerCase();
}

/**
 * Checks whether an email address belongs to the master Root Administrator.
 */
export function isRootAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getRootAdminEmail();
}

/**
 * Checks whether a session user has permission to view or manage staff and RBAC.
 */
export function canAccessStaffManagement(user?: {
  role?: string;
  permissions?: (string | null | undefined)[];
} | null): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) return true;
  const perms = user.permissions || [];
  return (
    perms.includes("*") ||
    perms.includes("user.manage") ||
    perms.includes("users") ||
    perms.includes("section.users")
  );
}

/**
 * Checks whether a session user has authority to assign SUPER_ADMIN role or wildcard '*' permissions.
 */
export function canAssignSuperAdmin(user?: {
  role?: string;
  permissions?: (string | null | undefined)[];
} | null): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN) return true;
  const perms = user.permissions || [];
  return perms.includes("*");
}

/**
 * Escapes regex special characters in user input to prevent ReDoS & RegExp Injection attacks.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Password Strength Validator:
 * Ensures passwords are at least 8 characters long with a mix of letters and numbers/symbols.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long for security" };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (!hasLetter || !hasDigitOrSpecial) {
    return { valid: false, message: "Password must contain both letters and numbers or symbols" };
  }
  return { valid: true };
}

// ============================================================
// Timing-Attack & User-Enumeration Mitigation
// ============================================================
// Pre-computed bcrypt cost-12 hash used for constant-time comparisons
const DUMMY_BCRYPT_HASH = "$2a$12$e8Yk2wQ6P2k3u4/KzL5X7.d3w5F7s6A1C2E3G4I5K6M7O8Q9S0U1W";

/**
 * Executes a dummy bcrypt compare to ensure login response latency is identical
 * whether the account exists or not, preventing username/email enumeration.
 */
export async function runDummyBcryptCompare(dummyInput = "dummy_password_timing_pad"): Promise<void> {
  try {
    await bcrypt.compare(dummyInput, DUMMY_BCRYPT_HASH);
  } catch {
    // Ignore dummy comparison exceptions
  }
}

// ============================================================
// In-Memory Sliding-Window Rate Limiter
// Protects against automated bots and brute-force credential stuffing.
// ============================================================
interface RateLimitRecord {
  attempts: number;
  lastAttemptAt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 10 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.lastAttemptAt > 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();
}

/**
 * Checks whether an action key (e.g. `login:ip` or `login:email`) is currently rate-limited.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  blockDurationMs = 15 * 60 * 1000
): { limited: boolean; remainingSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return { limited: false, remainingSeconds: 0 };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { limited: true, remainingSeconds };
  }

  // If previous block window expired, reset attempts
  if (record.blockedUntil && now >= record.blockedUntil) {
    rateLimitStore.delete(key);
    return { limited: false, remainingSeconds: 0 };
  }

  return { limited: false, remainingSeconds: 0 };
}

/**
 * Records a failed attempt for the given key and blocks if threshold is exceeded.
 */
export function recordFailedAttempt(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  blockDurationMs = 15 * 60 * 1000
): { blocked: boolean; remainingSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: 0, lastAttemptAt: now };

  // If outside sliding window, reset attempts
  if (now - record.lastAttemptAt > windowMs) {
    record.attempts = 1;
  } else {
    record.attempts += 1;
  }

  record.lastAttemptAt = now;

  if (record.attempts >= maxAttempts) {
    record.blockedUntil = now + blockDurationMs;
    rateLimitStore.set(key, record);
    return { blocked: true, remainingSeconds: Math.ceil(blockDurationMs / 1000) };
  }

  rateLimitStore.set(key, record);
  return { blocked: false, remainingSeconds: 0 };
}

/**
 * Resets failed attempts after a successful authentication.
 */
export function recordSuccessfulAttempt(key: string): void {
  rateLimitStore.delete(key);
}
