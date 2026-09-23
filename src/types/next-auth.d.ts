// ============================================================
// next-auth.d.ts — Session Type Augmentation
// Extends the default Session and JWT types to include
// our custom user fields (role, department, permissions, avatar).
// ============================================================

import type { DefaultSession, DefaultJWT } from "next-auth";
import type { RoleKey, PermissionKey, DepartmentKey } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleKey;
      department?: DepartmentKey;
      designation?: string;
      permissions: PermissionKey[];
      avatar?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: RoleKey;
    department?: DepartmentKey;
    designation?: string;
    permissions: PermissionKey[];
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: RoleKey;
    department?: DepartmentKey;
    designation?: string;
    permissions: PermissionKey[];
    avatar?: string;
  }
}
