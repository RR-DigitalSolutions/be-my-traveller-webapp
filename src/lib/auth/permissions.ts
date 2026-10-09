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
  HOTEL_VIEW: "hotel.view",
  HOTEL_CREATE: "hotel.create",
  HOTEL_EDIT: "hotel.edit",
  HOTEL_DELETE: "hotel.delete",
  HOTEL_CONFIRM: "hotel.confirm",
  HOTEL_VOUCHER: "hotel.voucher",
  HOTEL_INVENTORY: "hotel.inventory",
  HOTEL_SUPPLIER_MANAGE: "hotel.supplier_manage",

  // Transport & Fleet
  TRANSPORT_VIEW: "transport.view",
  TRANSPORT_CREATE: "transport.create",
  TRANSPORT_EDIT: "transport.edit",
  TRANSPORT_DELETE: "transport.delete",
  TRANSPORT_ASSIGN: "transport.assign",
  TRANSPORT_DISPATCH: "transport.dispatch",
  TRANSPORT_VOUCHER: "transport.voucher",
  TRANSPORT_FLEET: "transport.fleet",
  TRANSPORT_SUPPLIER_MANAGE: "transport.supplier_manage",

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

  // Payments & Accounts
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

  // Users / RBAC & HR
  USER_MANAGE: "user.manage",
  ROLE_MANAGE: "role.manage",
  HR_VIEW: "hr.view",
  HR_STAFF_CREATE: "hr.staff.create",
  HR_STAFF_EDIT: "hr.staff.edit",
  HR_STAFF_DELETE: "hr.staff.delete",
  HR_ROLE_ASSIGN: "hr.role.assign",
  HR_PERMISSIONS_MANAGE: "hr.permissions.manage",
  HR_DEPARTMENTS_MANAGE: "hr.departments.manage",
  HR_ATTENDANCE: "hr.attendance",

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
  SECTION_HOTEL: "hotels.manage",
  SECTION_TRANSPORT: "transport.manage",
  SECTION_PRODUCTS: "product.manage",
  SECTION_PRICING: "pricing.manage",
  SECTION_SALES: "sales.manage",
  SECTION_OPERATIONS: "operations.manage",
  SECTION_TASKS: "tasks.manage",
  SECTION_FINANCE: "finance.manage",
  SECTION_ACCOUNTS: "finance.manage",
  SECTION_HR: "user.manage",
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
  FINANCE_APPROVE_PAYABLE: "finance.payable.approve",
  FINANCE_DISBURSE: "finance.disburse",
  FINANCE_RECONCILE: "finance.reconcile",
  FINANCE_LEDGER: "finance.ledger",

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
  HOTEL: "HOTEL",
  TRANSPORT: "TRANSPORT",
  ACCOUNTS: "ACCOUNTS",
  FINANCE: "FINANCE", // Backward compatibility alias
  HR: "HR",
  OPERATIONS: "OPERATIONS",
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
    name: "Admin & Executive",
    badgeColor: "from-amber-500 to-amber-600",
    description: "Full master privilege across all platform sections, staff management and system settings.",
    defaultRole: "SUPER_ADMIN",
    defaultSections: [
      "dashboard",
      "sales",
      "hotels",
      "transport",
      "finance",
      "hr",
      "packages",
      "pricing",
      "content",
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
      "sales",
      "finance",
      "packages",
      "hotels",
      "transport",
      "pricing",
      "suppliers",
      "media",
    ],
  },
  SALES: {
    key: "SALES",
    name: "Sales & CRM",
    badgeColor: "from-emerald-500 to-teal-600",
    description: "Customer acquisition, lead pipeline, custom quotes, booking executions and customer CRM.",
    defaultRole: "SALES_AGENT",
    defaultSections: ["dashboard", "sales", "packages", "tasks"],
  },
  HOTEL: {
    key: "HOTEL",
    name: "Hotel Operations",
    badgeColor: "from-sky-500 to-blue-600",
    description: "Hotel room allocations, supplier vouchers, meal plan confirmations & inventory.",
    defaultRole: "HOTEL_MANAGER",
    defaultSections: ["dashboard", "hotels", "operations", "tasks"],
  },
  TRANSPORT: {
    key: "TRANSPORT",
    name: "Transport & Fleet",
    badgeColor: "from-amber-600 to-orange-600",
    description: "Fleet vehicle dispatch, driver trip sheets, transfer routes & transport vouchers.",
    defaultRole: "TRANSPORT_MANAGER",
    defaultSections: ["dashboard", "transport", "operations", "tasks"],
  },
  ACCOUNTS: {
    key: "ACCOUNTS",
    name: "Accounts & Finance",
    badgeColor: "from-emerald-600 to-teal-700",
    description: "Invoicing, payment collection, supplier payables, bank reconciliations & profitability.",
    defaultRole: "ACCOUNTS_MANAGER",
    defaultSections: ["dashboard", "finance", "tasks"],
  },
  FINANCE: {
    key: "FINANCE",
    name: "Finance & Accounts",
    badgeColor: "from-emerald-600 to-teal-700",
    description: "Invoicing, payment collection, supplier payables, bank reconciliations & profitability.",
    defaultRole: "FINANCE",
    defaultSections: ["dashboard", "finance", "tasks"],
  },
  HR: {
    key: "HR",
    name: "Human Resources",
    badgeColor: "from-pink-500 to-rose-600",
    description: "Staff onboarding, role assignment, granular RBAC permissions, attendance & departments.",
    defaultRole: "HR_MANAGER",
    defaultSections: ["dashboard", "users", "tasks"],
  },
  OPERATIONS: {
    key: "OPERATIONS",
    name: "General Operations",
    badgeColor: "from-indigo-600 to-violet-600",
    description: "Trip operations, hotel room allocations, fleet dispatch & driver coordination.",
    defaultRole: "OPERATIONS",
    defaultSections: ["dashboard", "hotels", "transport", "operations", "tasks"],
  },
  SUPPORT_CONTENT: {
    key: "SUPPORT_CONTENT",
    name: "Content & CMS",
    badgeColor: "from-blue-500 to-cyan-600",
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
    id: "hotels",
    name: "Hotel Desk",
    description: "Hotel room allocations, supplier vouchers, meal plan confirmations & inventory.",
    icon: "hotels",
    path: "/admin/operations/hotels",
    requiredPermission: "operation.hotel.manage",
  },
  {
    id: "transport",
    name: "Transport Desk",
    description: "Fleet vehicle dispatch, driver trip sheets, transfer routes & transport vouchers.",
    icon: "transport",
    path: "/admin/operations/transport",
    requiredPermission: "operation.transport.manage",
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
    name: "HR & Staff RBAC",
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
  SALES_MANAGER: "SALES_MANAGER",
  SALES_AGENT: "SALES_AGENT",
  HOTEL_MANAGER: "HOTEL_MANAGER",
  HOTEL_EXECUTIVE: "HOTEL_EXECUTIVE",
  TRANSPORT_MANAGER: "TRANSPORT_MANAGER",
  TRANSPORT_EXECUTIVE: "TRANSPORT_EXECUTIVE",
  ACCOUNTS_MANAGER: "ACCOUNTS_MANAGER",
  FINANCE: "FINANCE",
  HR_MANAGER: "HR_MANAGER",
  HR_EXECUTIVE: "HR_EXECUTIVE",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  SEO_MANAGER: "SEO_MANAGER",
  OPERATIONS: "OPERATIONS",
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
    Permission.SECTION_HOTEL,
    Permission.SECTION_TRANSPORT,
    Permission.SECTION_PRODUCTS,
    Permission.SECTION_PRICING,
    Permission.SECTION_SALES,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.SECTION_FINANCE,
    Permission.SECTION_ACCOUNTS,
    Permission.SECTION_HR,
    Permission.SECTION_MEDIA,
    Permission.SECTION_SEO,
    Permission.SECTION_SUPPLIERS,
    Permission.SECTION_ANALYTICS,
    Permission.SECTION_USERS,
    ...ALL_PERMISSIONS.filter(
      (p) => p !== Permission.SETTINGS_EDIT && p !== Permission.ROLE_MANAGE
    ),
  ],

  [Role.HOTEL_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_HOTEL,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.OPERATION_VIEW,
    Permission.OPERATION_HOTEL_MANAGE,
    Permission.HOTEL_VIEW,
    Permission.HOTEL_CREATE,
    Permission.HOTEL_EDIT,
    Permission.HOTEL_DELETE,
    Permission.HOTEL_CONFIRM,
    Permission.HOTEL_VOUCHER,
    Permission.HOTEL_INVENTORY,
    Permission.HOTEL_SUPPLIER_MANAGE,
    Permission.SUPPLIER_MANAGE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
    Permission.WORKFLOW_TRANSITION,
  ],

  [Role.HOTEL_EXECUTIVE]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_HOTEL,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.OPERATION_VIEW,
    Permission.OPERATION_HOTEL_MANAGE,
    Permission.HOTEL_VIEW,
    Permission.HOTEL_CONFIRM,
    Permission.HOTEL_VOUCHER,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.TRANSPORT_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_TRANSPORT,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.OPERATION_VIEW,
    Permission.OPERATION_TRANSPORT_MANAGE,
    Permission.OPERATION_DISPATCH,
    Permission.TRANSPORT_VIEW,
    Permission.TRANSPORT_CREATE,
    Permission.TRANSPORT_EDIT,
    Permission.TRANSPORT_DELETE,
    Permission.TRANSPORT_ASSIGN,
    Permission.TRANSPORT_DISPATCH,
    Permission.TRANSPORT_VOUCHER,
    Permission.TRANSPORT_FLEET,
    Permission.TRANSPORT_SUPPLIER_MANAGE,
    Permission.PRODUCT_MANAGE,
    Permission.SUPPLIER_MANAGE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
    Permission.WORKFLOW_TRANSITION,
  ],

  [Role.TRANSPORT_EXECUTIVE]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_TRANSPORT,
    Permission.SECTION_OPERATIONS,
    Permission.SECTION_TASKS,
    Permission.OPERATION_VIEW,
    Permission.OPERATION_TRANSPORT_MANAGE,
    Permission.TRANSPORT_VIEW,
    Permission.TRANSPORT_ASSIGN,
    Permission.TRANSPORT_DISPATCH,
    Permission.TRANSPORT_VOUCHER,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
  ],

  [Role.ACCOUNTS_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_FINANCE,
    Permission.SECTION_ACCOUNTS,
    Permission.SECTION_TASKS,
    Permission.SECTION_ANALYTICS,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_INVOICE_MANAGE,
    Permission.FINANCE_PAYABLE_MANAGE,
    Permission.FINANCE_APPROVE_PAYABLE,
    Permission.FINANCE_DISBURSE,
    Permission.FINANCE_RECONCILE,
    Permission.FINANCE_LEDGER,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_RECORD,
    Permission.PAYMENT_REFUND,
    Permission.BOOKING_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
  ],

  [Role.HR_MANAGER]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_USERS,
    Permission.SECTION_HR,
    Permission.SECTION_TASKS,
    Permission.USER_MANAGE,
    Permission.ROLE_MANAGE,
    Permission.HR_VIEW,
    Permission.HR_STAFF_CREATE,
    Permission.HR_STAFF_EDIT,
    Permission.HR_STAFF_DELETE,
    Permission.HR_ROLE_ASSIGN,
    Permission.HR_PERMISSIONS_MANAGE,
    Permission.HR_DEPARTMENTS_MANAGE,
    Permission.HR_ATTENDANCE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_UPDATE,
    Permission.TASK_COMPLETE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
  ],

  [Role.HR_EXECUTIVE]: [
    Permission.SECTION_DASHBOARD,
    Permission.SECTION_USERS,
    Permission.SECTION_HR,
    Permission.SECTION_TASKS,
    Permission.USER_MANAGE,
    Permission.HR_VIEW,
    Permission.HR_STAFF_CREATE,
    Permission.HR_STAFF_EDIT,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.NOTIFICATION_VIEW,
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

// ============================================================
// Granular Permission Groups Matrix
// Used in HR & Staff management for fine-grained access control
// ============================================================
export interface GranularPermissionItem {
  id: string;
  name: string;
  description: string;
}

export interface GranularPermissionCategory {
  id: string;
  name: string;
  department: DepartmentKey;
  icon: string;
  badgeColor: string;
  permissions: GranularPermissionItem[];
}

export const DETAILED_PERMISSION_GROUPS: GranularPermissionCategory[] = [
  {
    id: "hotels",
    name: "Hotel Operations",
    department: "HOTEL",
    icon: "🏨",
    badgeColor: "from-sky-500 to-blue-600",
    permissions: [
      { id: "hotel.view", name: "View Hotels & Bookings", description: "Access hotel operations desk, view confirmed room allocations." },
      { id: "hotel.create", name: "Create Hotel Records", description: "Add new partner hotels and room categories to catalog." },
      { id: "hotel.edit", name: "Edit Hotel Records", description: "Modify contracted rates, amenities, and contact persons." },
      { id: "hotel.confirm", name: "Confirm Room Allocations", description: "Mark room bookings as confirmed with supplier booking ref." },
      { id: "hotel.voucher", name: "Issue Hotel Vouchers", description: "Generate and send official hotel check-in vouchers to guests." },
      { id: "hotel.inventory", name: "Manage Room Inventory", description: "Update room allotment, seasonal cutoffs, and blackout dates." },
      { id: "hotel.supplier_manage", name: "Manage Hotel Suppliers", description: "Handle hotel vendor accounts and payment terms." },
    ],
  },
  {
    id: "transport",
    name: "Transport & Fleet Desk",
    department: "TRANSPORT",
    icon: "🚗",
    badgeColor: "from-amber-600 to-orange-600",
    permissions: [
      { id: "transport.view", name: "View Fleet & Transfers", description: "Access transport operations desk, view assigned vehicles." },
      { id: "transport.assign", name: "Assign Driver & Vehicle", description: "Allocate vehicle (Innova, Tempo, Sedan) and driver to booking." },
      { id: "transport.dispatch", name: "Dispatch & Trip Sheets", description: "Issue trip sheets and dispatch vehicle for customer pickup." },
      { id: "transport.voucher", name: "Issue Transport Vouchers", description: "Generate transport duty slips and cab vouchers." },
      { id: "transport.fleet", name: "Manage Fleet & Rates", description: "Configure vehicle types, per-km/toll rates, and transfer routes." },
      { id: "transport.supplier_manage", name: "Manage Transporter Vendors", description: "Manage driver partners, fleet owners, and vendor billing." },
    ],
  },
  {
    id: "finance",
    name: "Accounts & Finance",
    department: "ACCOUNTS",
    icon: "💳",
    badgeColor: "from-emerald-600 to-teal-700",
    permissions: [
      { id: "finance.view", name: "View Financial Records", description: "Access revenue dashboard, financial summaries, and invoice lists." },
      { id: "finance.invoice.manage", name: "Generate & Manage Invoices", description: "Create tax invoices, credit notes, and customer billing." },
      { id: "payment.record", name: "Record Customer Payments", description: "Mark customer advances, UPI/NEFT receipts, and card payments." },
      { id: "payment.refund", name: "Process Payment Refunds", description: "Initiate cancellations and refunds to client bank accounts." },
      { id: "finance.payable.manage", name: "Manage Supplier Payables", description: "Track supplier dues for hotels, transporters, and guides." },
      { id: "finance.payable.approve", name: "Approve Supplier Payables", description: "Authorize payout requests before fund disbursement." },
      { id: "finance.disburse", name: "Disburse Supplier Payments", description: "Record bank payout references to vendors." },
      { id: "finance.reconcile", name: "Bank & Ledger Reconciliation", description: "Reconcile bank statements and booking profitability." },
    ],
  },
  {
    id: "hr",
    name: "Human Resources & Staff RBAC",
    department: "HR",
    icon: "👥",
    badgeColor: "from-pink-500 to-rose-600",
    permissions: [
      { id: "user.manage", name: "View Staff Directory", description: "View staff list, active status, and departmental assignment." },
      { id: "hr.staff.create", name: "Create Staff Accounts", description: "Register new staff credentials across sales, ops, and accounts." },
      { id: "hr.staff.edit", name: "Edit Staff Details", description: "Update employee designation, phone, avatar, and active status." },
      { id: "hr.permissions.manage", name: "Manage RBAC Permissions", description: "Assign section access and granular permission checkboxes." },
      { id: "hr.departments.manage", name: "Manage Department Rosters", description: "Reallocate staff between departments and teams." },
      { id: "hr.attendance", name: "Staff Activity & Logs", description: "Track login sessions and operational task completion." },
    ],
  },
  {
    id: "sales",
    name: "Sales & CRM Pipeline",
    department: "SALES",
    icon: "💼",
    badgeColor: "from-emerald-500 to-teal-600",
    permissions: [
      { id: "lead.view", name: "View Leads Pipeline", description: "Access CRM leads, inquiries, and customer contact info." },
      { id: "lead.edit", name: "Update Lead Stage", description: "Change stage (Hot, Warm, Follow-up, Won, Lost) and log calls." },
      { id: "lead.assign", name: "Assign Leads", description: "Distribute incoming customer leads to sales executives." },
      { id: "quote.create", name: "Build Day-wise Quotations", description: "Design day-wise itinerary proposals with hotels & cabs." },
      { id: "quote.edit", name: "Edit Quotations", description: "Revise quotation pricing, hotel tiers, and pax breakdown." },
      { id: "quote.send", name: "Send via WhatsApp & Email", description: "Dispatch customized holiday proposals directly to clients." },
      { id: "quote.approve_discount", name: "Approve Quotation Discounts", description: "Grant special promotional markdowns and waivers." },
      { id: "customer.view", name: "View Customer Profiles", description: "Access repeat traveller profiles and booking history." },
      { id: "booking.create", name: "Convert Quote to Booking", description: "Lock itinerary and transition lead into confirmed booking." },
    ],
  },
  {
    id: "packages",
    name: "Tour Packages & Catalog",
    department: "MANAGEMENT",
    icon: "🎒",
    badgeColor: "from-amber-500 to-yellow-600",
    permissions: [
      { id: "package.create", name: "Create Tour Packages", description: "Design public tour packages with 3-tier hotel options." },
      { id: "package.edit", name: "Edit Tour Packages", description: "Update day-wise itineraries, inclusions, and photography." },
      { id: "package.publish", name: "Publish / Unpublish Packages", description: "Make packages live on the public traveller website." },
      { id: "pricing.view", name: "View Pricing Rules", description: "View season multipliers, peak hike rules, and discounts." },
      { id: "pricing.edit", name: "Edit Pricing Rules", description: "Configure seasonal surcharges, weekend rates, and tax rules." },
    ],
  },
  {
    id: "content",
    name: "Content, Media & SEO",
    department: "SUPPORT_CONTENT",
    icon: "📝",
    badgeColor: "from-cyan-500 to-blue-500",
    permissions: [
      { id: "content.create", name: "Create CMS Articles & Guides", description: "Write destination guides, travel blogs, and FAQs." },
      { id: "content.edit", name: "Edit CMS Content", description: "Update articles, customer reviews, and homepage banners." },
      { id: "content.publish", name: "Publish CMS Content", description: "Publish blog posts and tourist attraction descriptions." },
      { id: "media.upload", name: "Upload Media to R2", description: "Upload high-resolution photography and documents." },
      { id: "seo.edit", name: "Edit SEO Metadata", description: "Manage meta titles, OpenGraph images, and 301 redirects." },
    ],
  },
];
