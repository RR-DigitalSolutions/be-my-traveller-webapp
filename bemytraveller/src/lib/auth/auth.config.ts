import type { NextAuthConfig } from "next-auth";
import type { RoleKey, PermissionKey, DepartmentKey } from "@/lib/auth/permissions";

export const authConfig: NextAuthConfig = {
  providers: [], // Empty providers for Edge runtime middleware
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.role = (user as { role: RoleKey }).role;
        token.department = (user as { department?: DepartmentKey }).department;
        token.designation = (user as { designation?: string }).designation;
        token.permissions = Array.isArray((user as { permissions?: PermissionKey[] }).permissions)
          ? [...((user as { permissions?: PermissionKey[] }).permissions || [])]
          : [];
        token.avatar = (user as { avatar?: string }).avatar;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as RoleKey;
        session.user.department = token.department as DepartmentKey | undefined;
        session.user.designation = token.designation as string | undefined;
        session.user.permissions = Array.isArray(token.permissions) ? [...(token.permissions as PermissionKey[])] : [];
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  trustHost: true,
};
