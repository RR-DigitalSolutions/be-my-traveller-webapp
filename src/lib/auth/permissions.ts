// ============================================================
// RBAC — Permission Enum
// All platform permissions in one central place.
// Never define permissions as raw strings outside this file.
// ============================================================

export const Permission = {
  // Destinations
  DESTINATION_CREATE: "destination.create",
  DESTINATION_EDIT: "destination.edit",
  DESTINATION_PUBLISH: "destination.publish",
  DESTINATION_DELETE: "destination.delete",

  // Packages
  PACKAGE_CREATE: "package.create",
  PACKAGE_EDIT: "package.edit",
  PACKAGE_APPROVE: "package.approve",
  PACKAGE_PUBLISH: "package.publish",
  PACKAGE_DELETE: "package.delete",

  // Hotels
  HOTEL_CREATE: "hotel.create",
  HOTEL_EDIT: "hotel.edit",
  HOTEL_DELETE: "hotel.delete",

  // Activities
  ACTIVITY_CREATE: "activity.create",
  ACTIVITY_EDIT: "activity.edit",
  ACTIVITY_DELETE: "activity.delete",

  // Products / Transfers
  PRODUCT_MANAGE: "product.manage",

  // Pricing
  PRICING_VIEW: "pricing.view",
  PRICING_EDIT: "pricing.edit",
  PRICING_APPROVE: "pricing.approve",

  // Discounts & Coupons
  DISCOUNT_MANAGE: "discount.manage",
  COUPON_MANAGE: "coupon.manage",

  // SEO
  SEO_EDIT: "seo.edit",
  SEO_PUBLISH: "seo.publish",

  // CMS — Blogs, Pages, Guides, FAQs, Reviews, Destinations
  CONTENT_CREATE: "content.create",
  CONTENT_EDIT: "content.edit",
  CONTENT_PUBLISH: "content.publish",
  CONTENT_DELETE: "content.delete",

  // Leads
  LEAD_VIEW: "lead.view",
  LEAD_EDIT: "lead.edit",
  LEAD_ASSIGN: "lead.assign",
  LEAD_DELETE: "lead.delete",

  // Quotes
  QUOTE_CREATE: "quote.create",
  QUOTE_EDIT: "quote.edit",
  QUOTE_SEND: "quote.send",
  QUOTE_APPROVE_DISCOUNT: "quote.approve_discount",

  // Bookings
  BOOKING_VIEW: "booking.view",
  BOOKING_CREATE: "booking.create",
  BOOKING_EDIT: "booking.edit",
  BOOKING_CANCEL: "booking.cancel",

  // Payments
  PAYMENT_VIEW: "payment.view",
  PAYMENT_RECORD: "payment.record",
  PAYMENT_REFUND: "payment.refund",

  // Customers
  CUSTOMER_VIEW: "customer.view",
  CUSTOMER_EDIT: "customer.edit",

  // Suppliers
  SUPPLIER_MANAGE: "supplier.manage",

  // Media
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",

  // Users / RBAC
  USER_MANAGE: "user.manage",
  ROLE_MANAGE: "role.manage",

  // Audit
  AUDIT_VIEW: "audit.view",

  // Settings
  SETTINGS_EDIT: "settings.edit",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",

  // Redirects
  REDIRECT_MANAGE: "redirect.manage",

  // High-level Section Permissions
  SECTION_DASHBOARD: "dashboard.view",
  SECTION_CONTENT: "content.manage",
  SECTION_PACKAGES: "package.manage",
  SECTION_PRODUCTS: "product.manage",
  SECTION_PRICING: "pricing.manage",
  SECTION_SALES: "sales.manage",
  SECTION_OPERATIONS: "operations.manage",
  SECTION_TASKS: "tasks.manage",
  SECTION_FINANCE: "finance.manage",
  SECTION_MEDIA: "media.manage",
  SECTION_SEO: "seo.manage",
  SECTION_SUPPLIERS: "supplier.manage",
  SECTION_ANALYTICS: "analytics.view",
  SECTION_USERS: "user.manage",
  SECTION_SETTINGS: "settings.manage",

  // Operations Desk
  OPERATION_VIEW: "operation.view",
  OPERATION_HOTEL_MANAGE: "operation.hotel.manage",
  OPERATION_TRANSPORT_MANAGE: "operation.transport.manage",
  OPERATION_ACTIVITY_MANAGE: "operation.activity.manage",
  OPERATION_DISPATCH: "operation.dispatch",

  // Operational Tasks
  TASK_VIEW: "task.view",
  TASK_CREATE: "task.create",
  TASK_ASSIGN: "task.assign",
  TASK_UPDATE: "task.update",
  TASK_COMPLETE: "task.complete",

  // Notifications
  NOTIFICATION_VIEW: "notification.view",
  NOTIFICATION_SEND: "notification.send",
  NOTIFICATION_TEMPLATE_MANAGE: "notification.template.manage",

  // Finance & Ledgers
  FINANCE_VIEW: "finance.view",
  FINANCE_INVOICE_MANAGE: "finance.invoice.manage",
  FINANCE_PAYABLE_MANAGE: "finance.payable.manage",
  FINANCE_RECONCILE: "finance.reconcile",

  // Workflows & State Machines
  WORKFLOW_TRANSITION: "workflow.transition",
  WORKFLOW_OVERRIDE: "workflow.override",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission] | string;

// ============================================================
// Department Enum — Primary Platform Departments & Custom
// ============================================================
export const Department = {
  ADMIN: "ADMIN",
  MANAGEMENT: "MANAGEMENT",
  SALES: "SALES",
  OPERATIONS: "OPERATIONS",
  FINANCE: "FINANCE",
  SUPPORT_CONTENT: "SUPPORT_CONTENT",
  CUSTOM: "CUSTOM",
} as const;

export type DepartmentKey = (typeof Department)[keyof typeof Department];

export interface DepartmentInfo {
  key: DepartmentKey;
  name: string;
  badgeColor: string;
  description: string;
  defaultRole: RoleKey;
  defaultSections: string[];
}

export const DEPARTMENTS: Record<DepartmentKey, DepartmentInfo> = {
  ADMIN: {
    key: "ADMIN",
    name: "Admin",
    badgeColor: "from-amber-500 to-amber-600",
    description: "Full master privilege across all platform sections, staff management and system settings.",
    defaultRole: "SUPER_ADMIN",
    defaultSections: [
      "dashboard",
      "content",
      "packages",
      "products",
      "pricing",
      "sales",
      "media",
      "seo",
      "suppliers",
      "analytics",
      "users",
      "settings",
    ],
  },
  MANAGEMENT: {
    key: "MANAGEMENT",
    name: "Company Management",
    badgeColor: "from-purple-500 to-indigo-600",
    description: "Executive suite with oversight of dashboard metrics, analytics, packages, pricing, sales & suppliers.",
    defaultRole: "ADMIN",
    defaultSections: [
      "dashboard",
      "analytics",
      "packages",
      "products",
      "pricing",
      "suppliers",
      "sales",
      "media",
    ],
  },
  SALES: {
    key: "SALES",
    name: "Sales Executives",
    badgeColor: "from-emerald-500 to-teal-600",
    description: "Customer acquisition, lead management, custom quotes, booking executions and customer CRM.",
    defaultRole: "SALES_AGENT",
    defaultSections: ["dashboard", "sales", "packages", "tasks"],
  },
  OPERATIONS: {
    key: "OPERATIONS",
    name: "Operations & Fleet",
    badgeColor: "from-amber-600 to-orange-600",
    description: "Trip operations, hotel room allocations, fleet dispatch, driver trip sheets & activity coordination.",
    defaultRole: "OPERATIONS",
    defaultSections: ["dashboard", "operations", "tasks", "products", "suppliers"],
  },
  FINANCE: {
    key: "FINANCE",
    name: "Finance & Accounts",
    badgeColor: "from-emerald-600 to-teal-700",
    description: "Invoicing, payment collection, supplier payables, bank reconciliations & profitability.",
    defaultRole: "FINANCE",
    defaultSections: ["dashboard", "finance", "tasks", "sales", "analytics"],
  },
  SUPPORT_CONTENT: {
    key: "SUPPORT_CONTENT",
    name: "Support & Content Management",
    badgeColor: "from-sky-500 to-blue-600",
    description: "Content management across destinations, tour packages, attractions, blogs, FAQs, media and SEO.",
    defaultRole: "CONTENT_MANAGER",
    defaultSections: ["content", "packages", "media", "seo"],
  },
  CUSTOM: {
    key: "CUSTOM",
    name: "Custom Access",
    badgeColor: "from-slate-500 to-slate-600",
    description: "Tailored granular access assigned by the Administrator.",
    defaultRole: "EDITOR",
    defaultSections: ["dashboard"],
  },
};

// ============================================================
// Granular Section Definition
// ============================================================
export interface AdminSectionConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  requiredPermission: string;
}

export const ADMIN_SECTIONS: AdminSectionConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard & KPIs",
    description: "Executive performance overview, metrics and real-time activity feed.",
    icon: "dashboard",
    path: "/admin/dashboard",
    requiredPermission: "dashboard.view",
  },
  {
    id: "content",
    name: "Content Management",
    description: "Destinations, attractions, activities, blogs, FAQs, reviews & pages.",
    icon: "content",
    path: "/admin/content",
    requiredPermission: "content.manage",
  },
  {
    id: "packages",
    name: "Tour Packages",
    description: "Catalog creation, 3-tier pricing (Deluxe, Super Deluxe, Luxury) & season hike setups.",
    icon: "packages",
    path: "/admin/packages",
    requiredPermission: "package.manage",
  },
  {
    id: "products",
    name: "Products & Transfers",
    description: "Hotel inventory, activities and point-to-point / hourly transfer fleet.",
    icon: "products",
    path: "/admin/products/transfers",
    requiredPermission: "product.manage",
  },
  {
    id: "pricing",
    name: "Pricing & Rules",
    description: "Dynamic pricing rules, seasonal date presets, discount codes and tax rules.",
    icon: "pricing",
    path: "/admin/pricing",
    requiredPermission: "pricing.manage",
  },
  {
    id: "sales",
    name: "Sales & CRM",
    description: "Leads pipeline, customer records, dynamic quotes and booking lifecycle.",
    icon: "sales",
    path: "/admin/leads",
    requiredPermission: "sales.manage",
  },
  {
    id: "operations",
    name: "Operations Desk",
    description: "Hotel confirmations, transport dispatch, activity coordination & trip execution.",
    icon: "operations",
    path: "/admin/operations",
    requiredPermission: "operations.manage",
  },
  {
    id: "tasks",
    name: "Operational Tasks",
    description: "Cross-departmental action items, deadlines, SLA tracking & assignments.",
    icon: "tasks",
    path: "/admin/tasks",
    requiredPermission: "tasks.manage",
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    description: "Customer invoices, supplier payables, payment reconciliation & financial ledgers.",
    icon: "finance",
    path: "/admin/finance",
    requiredPermission: "finance.manage",
  },
  {
    id: "media",
    name: "Media Library",
    description: "Cloudflare R2 image library, upload manager and asset optimization.",
    icon: "media",
    path: "/admin/media",
    requiredPermission: "media.manage",
  },
  {
    id: "seo",
    name: "SEO Studio",
    description: "Meta tags, OpenGraph previews, URL 301 redirects and XML sitemaps.",
    icon: "seo",
    path: "/admin/seo",
    requiredPermission: "seo.manage",
  },
  {
    id: "suppliers",
    name: "Suppliers & Vendors",
    description: "Supplier contacts, contract rates, vehicle fleets and vendor ratings.",
    icon: "suppliers",
    path: "/admin/suppliers",
    requiredPermission: "supplier.manage",
  },
  {
    id: "analytics",
    name: "Analytics & Reports",
    description: "Revenue breakdown, conversion funnels and inquiry analytics.",
    icon: "analytics",
    path: "/admin/analytics",
    requiredPermission: "analytics.view",
  },
  {
    id: "users",
    name: "Staff & RBAC",
    description: "Staff accounts, department allocation, custom logins and section privileges.",
    icon: "users",
    path: "/admin/users",
    requiredPermission: "user.manage",
  },
  {
    id: "settings",
    name: "Platform Settings",
    description: "Core website configuration, payment gateways and security credentials.",
    icon: "settings",
    path: "/admin/settings",
    requiredPermission: "settings.manage",
  },
];

// ============================================================
// Role Enum
// ============================================================
export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  SEO_MANAGER: "SEO_MANAGER",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_AGENT: "SALES_AGENT",
  OPERATIONS: "OPERATIONS",
  FINANCE: "FINANCE",
  EDITOR: "EDITOR",
} as const;

export type RoleKey = (typeof Role)[keyof typeof Role];

// ============================================================
// Role → Permission Mapping
// ============================================================
const ALL_PERMISSIONS = Object.values(Permission) as PermissionKey[];

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  [Role.SUPER_ADMIN]: ["*", ...ALL_PERMISSIONS],

  [Role.ADMIN]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_CONTENT,
    Permission.SECTION_PACKAGES,
    Permission.SECTION_PRODUCTS,
    Permission.SECTION_PRICING,
    Permission.SECTION_SALES,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.SECTION_FINANCE,
    Permission.SECTION_MEDIA,
    Permission.SECTION_SEO,
    Permission.SECTION_SUPPLIERS,
    Permission.SECTION_ANALYTICS,
    Permission.SECTION_USERS,
    ...ALL_PERMISSIONS.filter(
      (p) => p !== Permission.SETTINGS_EDIT && p !== Permission.ROLE_MANAGE
    ),
  ],

  [Role.PRODUCT_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_PACKAGES,
    Permission.SECTION_PRODUCTS,
    Permission.SECTION_PRICING,
    Permission.SECTION_TASKS,
    Permission.SECTION_MEDIA,
    Permission.DESTINATION_CREATE,
    Permission.DESTINATION_EDIT,
    Permission.DESTINATION_PUBLISH,
    Permission.PACKAGE_CREATE,
    Permission.PACKAGE_EDIT,
    Permission.PACKAGE_APPROVE,
    Permission.HOTEL_CREATE,
    Permission.HOTEL_EDIT,
    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_EDIT,
    Permission.PRODUCT_MANAGE,
    Permission.PRICING_VIEW,
    Permission.PRICING_EDIT,
    Permission.PRICING_APPROVE,
    Permission.DISCOUNT_MANAGE,
    Permission.COUPON_MANAGE,
    Permission.SEO_EDIT,
    Permission.CONTENT_EDIT,
    Permission.MEDIA_UPLOAD,
    Permission.ANALYTICS_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.CONTENT_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_CONTENT,
    Permission.SECTION_PACKAGES,
    Permission.SECTION_TASKS,
    Permission.SECTION_MEDIA,
    Permission.SECTION_SEO,
    Permission.DESTINATION_EDIT,
    Permission.PACKAGE_EDIT,
    Permission.HOTEL_EDIT,
    Permission.ACTIVITY_EDIT,
    Permission.SEO_EDIT,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
    Permission.MEDIA_UPLOAD,
    Permission.REDIRECT_MANAGE,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.SEO_MANAGER]: [
    Permission.SECTION_SEO,
    Permission.SECTION_CONTENT,
    Permission.SECTION_ANALYTICS,
    Permission.SEO_EDIT,
    Permission.SEO_PUBLISH,
    Permission.CONTENT_EDIT,
    Permission.REDIRECT_MANAGE,
    Permission.ANALYTICS_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.SALES_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_SALES,
    Permission.SECTION_PACKAGES,
    Permission.SECTION_TASKS,
    Permission.SECTION_ANALYTICS,
    Permission.LEAD_VIEW,
    Permission.LEAD_EDIT,
    Permission.LEAD_ASSIGN,
    Permission.QUOTE_CREATE,
    Permission.QUOTE_EDIT,
    Permission.QUOTE_SEND,
    Permission.QUOTE_APPROVE_DISCOUNT,
    Permission.BOOKING_VIEW,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_EDIT,
    Permission.BOOKING_CANCEL,
    Permission.PAYMENT_VIEW,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_EDIT,
    Permission.PRICING_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.WORKFLOW_TRANSITION,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
  ],

  [Role.SALES_AGENT]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_SALES,
    Permission.SECTION_PACKAGES,
    Permission.SECTION_TASKS,
    Permission.LEAD_VIEW,
    Permission.LEAD_EDIT,
    Permission.QUOTE_CREATE,
    Permission.QUOTE_EDIT,
    Permission.QUOTE_SEND,
    Permission.BOOKING_VIEW,
    Permission.BOOKING_CREATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_EDIT,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.WORKFLOW_TRANSITION,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.OPERATIONS]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.SECTION_SALES,
    Permission.SECTION_SUPPLIERS,
    Permission.SECTION_PRODUCTS,
    Permission.OPERATION_VIEW,
    Permission.OPERATION_HOTEL_MANAGE,
    Permission.OPERATION_TRANSPORT_MANAGE,
    Permission.OPERATION_ACTIVITY_MANAGE,
    Permission.OPERATION_DISPATCH,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
    Permission.WORKFLOW_TRANSITION,
    Permission.LEAD_VIEW,
    Permission.BOOKING_VIEW,
    Permission.BOOKING_EDIT,
    Permission.BOOKING_CREATE,
    Permission.PAYMENT_VIEW,
    Permission.CUSTOMER_VIEW,
    Permission.SUPPLIER_MANAGE,
    Permission.ANALYTICS_VIEW,
  ],

  [Role.FINANCE]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_FINANCE,
    Permission.SECTION_TASKS,
    Permission.SECTION_ANALYTICS,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_INVOICE_MANAGE,
    Permission.FINANCE_PAYABLE_MANAGE,
    Permission.FINANCE_RECONCILE,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_RECORD,
    Permission.PAYMENT_REFUND,
    Permission.BOOKING_VIEW,
    Permission.ANALYTICS_VIEW,
  ],

  [Role.EDITOR]: [
    Permission.SECTION_CONTENT,
    Permission.SECTION_MEDIA,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.MEDIA_UPLOAD,
    Permission.SEO_EDIT,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.NOTIFICATION_VIEW,
  ],
};

/**
 * Returns all effective permissions for a given role + any user-level permission overrides.
 */
export function getEffectivePermissions(
  role: RoleKey,
  additionalPermissions: PermissionKey[] = []
): Set<PermissionKey> {
  const rolePerms = ROLE_PERMISSIONS[role] ?? [];
  return new Set([...rolePerms, ...additionalPermissions]);
}

/**
 * Check if a role (+ overrides) has a specific permission.
 */
export function hasPermission(
  role: RoleKey,
  permission: PermissionKey,
  additionalPermissions: PermissionKey[] = []
): boolean {
  if (role === Role.SUPER_ADMIN) return true;
  if (additionalPermissions.includes("*")) return true;
  const effective = getEffectivePermissions(role, additionalPermissions);
  return effective.has(permission);
}

/**
 * Check if a user has access to a particular admin section (e.g. "content", "packages", "sales")
 */
export function hasSectionAccess(
  user: {
    role?: RoleKey;
    permissions?: (PermissionKey | string)[];
    department?: DepartmentKey;
  } | null | undefined,
  sectionId: string
): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN) return true;
  
  const perms = user.permissions || [];
  if (perms.includes("*")) return true;

  // Direct section permission matches
  const sectionKey = `section.${sectionId}`;
  const sectionManage = `${sectionId}.manage`;
  const sectionView = `${sectionId}.view`;
  const wildCard = `${sectionId}.*`;

  if (
    perms.includes(sectionId) ||
    perms.includes(sectionKey) ||
    perms.includes(sectionManage) ||
    perms.includes(sectionView) ||
    perms.includes(wildCard)
  ) {
    return true;
  }

  // Check role-based defaults
  if (user.role && ROLE_PERMISSIONS[user.role]) {
    const rolePerms = ROLE_PERMISSIONS[user.role];
    if (
      rolePerms.includes(sectionKey as PermissionKey) ||
      rolePerms.includes(sectionManage as PermissionKey) ||
      rolePerms.includes(sectionView as PermissionKey)
    ) {
      return true;
    }
  }

  // Check department preset defaults if department specified
  if (user.department && DEPARTMENTS[user.department]) {
    const deptInfo = DEPARTMENTS[user.department];
    if (deptInfo.defaultSections.includes(sectionId)) {
      return true;
    }
  }

  return false;
}
