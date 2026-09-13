"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Department,
  type DepartmentKey,
  DEPARTMENTS,
  ADMIN_SECTIONS,
  Role,
  type RoleKey,
} from "@/lib/auth/permissions";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: RoleKey;
  department: DepartmentKey;
  designation?: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  permissions: string[];
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface StatsSummary {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminCount: number;
  managementCount: number;
  salesCount: number;
  supportContentCount: number;
  customCount: number;
}

const SECTION_PERMISSION_MAP: Record<string, string> = {
  dashboard: "dashboard.view",
  content: "content.manage",
  packages: "package.manage",
  products: "product.manage",
  pricing: "pricing.manage",
  sales: "sales.manage",
  media: "media.manage",
  seo: "seo.manage",
  suppliers: "supplier.manage",
  analytics: "analytics.view",
  users: "user.manage",
  settings: "settings.manage",
};

const SECTION_ICONS: Record<string, string> = {
  dashboard: "📊",
  content: "📝",
  packages: "🎒",
  products: "🚗",
  pricing: "🏷️",
  sales: "💼",
  media: "🖼️",
  seo: "🔍",
  suppliers: "🤝",
  analytics: "📈",
  users: "👥",
  settings: "⚙️",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "SALES" as DepartmentKey,
    role: "SALES_AGENT" as RoleKey,
    designation: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    avatar: "",
    selectedSections: [] as string[],
  });

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState<StaffUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || null);
      } else {
        showToast(data.error || "Failed to load staff members", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery.trim() ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDeptFilter === "ALL" || u.department === selectedDeptFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" || u.status === selectedStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [users, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setEditingUserId(null);
    const defaultDept = Department.SALES;
    const defaultSections = DEPARTMENTS[defaultDept].defaultSections;
    setFormData({
      name: "",
      email: "",
      password: generateRandomPassword(),
      department: defaultDept,
      role: DEPARTMENTS[defaultDept].defaultRole,
      designation: "Sales Executive",
      phone: "",
      status: "ACTIVE",
      avatar: "",
      selectedSections: [...defaultSections],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: StaffUser) => {
    setModalMode("EDIT");
    setEditingUserId(user._id);

    // Calculate which sections the user currently has
    const userSections: string[] = [];
    ADMIN_SECTIONS.forEach((sec) => {
      const permKey = SECTION_PERMISSION_MAP[sec.id];
      if (
        user.permissions.includes("*") ||
        user.permissions.includes(sec.id) ||
        user.permissions.includes(permKey) ||
        user.permissions.includes(`${sec.id}.manage`) ||
        user.permissions.includes(`${sec.id}.view`) ||
        user.role === Role.SUPER_ADMIN
      ) {
        userSections.push(sec.id);
      }
    });

    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Leave blank unless resetting
      department: user.department || "SUPPORT_CONTENT",
      role: user.role,
      designation: user.designation || "",
      phone: user.phone || "",
      status: user.status,
      avatar: user.avatar || "",
      selectedSections: userSections.length > 0 ? userSections : DEPARTMENTS[user.department || "SUPPORT_CONTENT"]?.defaultSections || ["dashboard"],
    });
    setIsModalOpen(true);
  };

  // Department Selection in Modal
  const handleDepartmentChange = (dept: DepartmentKey) => {
    const deptConfig = DEPARTMENTS[dept];
    setFormData((prev) => ({
      ...prev,
      department: dept,
      role: deptConfig.defaultRole,
      selectedSections: [...deptConfig.defaultSections],
      designation:
        prev.designation && prev.designation !== "Sales Executive" && prev.designation !== "Staff Member"
          ? prev.designation
          : dept === "SALES"
          ? "Sales Executive"
          : dept === "MANAGEMENT"
          ? "Management Executive"
          : dept === "SUPPORT_CONTENT"
          ? "Content & Support Specialist"
          : "System Administrator",
    }));
  };

  // Section Toggle
  const toggleSection = (sectionId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSections.includes(sectionId);
      const updated = exists
        ? prev.selectedSections.filter((id) => id !== sectionId)
        : [...prev.selectedSections, sectionId];
      return { ...prev, selectedSections: updated };
    });
  };

  const handleSelectAllSections = () => {
    setFormData((prev) => ({
      ...prev,
      selectedSections: ADMIN_SECTIONS.map((s) => s.id),
    }));
  };

  const handleClearAllSections = () => {
    setFormData((prev) => ({
      ...prev,
      selectedSections: [],
    }));
  };

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + "2026!";
  }

  // Submit User Form (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Name and Email are required", "error");
      return;
    }

    if (modalMode === "CREATE" && (!formData.password || formData.password.length < 6)) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);

    // Map selected sections to permission strings
    const permissions: string[] = [];
    if (formData.department === "ADMIN" || formData.role === Role.SUPER_ADMIN) {
      permissions.push("*");
    }
    formData.selectedSections.forEach((secId) => {
      const perm = SECTION_PERMISSION_MAP[secId];
      if (perm && !permissions.includes(perm)) {
        permissions.push(perm);
      }
      if (!permissions.includes(secId)) {
        permissions.push(secId);
      }
    });

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department,
      role: formData.role,
      designation: formData.designation.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      avatar: formData.avatar.trim(),
      permissions,
      ...(formData.password ? { password: formData.password } : {}),
    };

    try {
      const url =
        modalMode === "CREATE"
          ? "/api/v1/admin/users"
          : `/api/v1/admin/users/${editingUserId}`;
      const method = modalMode === "CREATE" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          modalMode === "CREATE"
            ? "Staff member registered successfully"
            : "Staff member updated successfully"
        );
        setIsModalOpen(false);
        fetchUsers();
      } else {
        showToast(result.error || "Failed to save user account", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: StaffUser) => {
    if (user.role === Role.SUPER_ADMIN || user.email === "admin@bemytraveller.com") {
      showToast("Master Super Admin cannot be deleted", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete staff account for ${user.name} (${user.email})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${user._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Staff account deleted successfully");
        // Update local state immediately
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        fetchUsers();
      } else {
        showToast(result.error || "Failed to delete account", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete user", "error");
    }
  };

  // Quick Password Reset
  const handleQuickPasswordReset = async () => {
    if (!resetModalUser || !newPasswordInput || newPasswordInput.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${resetModalUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordInput }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Password for ${resetModalUser.name} reset successfully`);
        setResetModalUser(null);
        setNewPasswordInput("");
      } else {
        showToast(result.error || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to reset password", "error");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Compact, Crisp Department Badges
  const renderDepartmentBadge = (deptKey?: DepartmentKey) => {
    switch (deptKey) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
            <span>👑</span>
            <span>Admin</span>
          </span>
        );
      case "MANAGEMENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 whitespace-nowrap">
            <span>🏢</span>
            <span>Company Management</span>
          </span>
        );
      case "SALES":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            <span>💼</span>
            <span>Sales Executives</span>
          </span>
        );
      case "SUPPORT_CONTENT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 whitespace-nowrap">
            <span>✍️</span>
            <span>Content & Support</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    }
    if (status === "SUSPENDED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-950/80 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Inactive
      </span>
    );
  };

  return (
    <div className="relative min-h-full pb-20 text-slate-100 font-sans">
      {/* Hidden RRDS Watermark */}
      <div className="absolute right-4 top-1 text-[10px] text-slate-700/30 pointer-events-none font-mono select-none tracking-widest uppercase">
        RRDS-RBAC-ENGINE-v2.8
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/95 text-emerald-200 border-emerald-500/40"
              : "bg-rose-950/95 text-rose-200 border-rose-500/40"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Staff & RBAC Privileges</h1>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                {users.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage custom CMS staff logins, department presets & section-by-section access permissions.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Register Staff Member
        </button>
      </div>

      {/* 4 Department Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Admin */}
        <div
          onClick={() => setSelectedDeptFilter(selectedDeptFilter === "ADMIN" ? "ALL" : "ADMIN")}
          className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
            selectedDeptFilter === "ADMIN"
              ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/60"
              : "bg-slate-900/80 border-slate-800/90 hover:border-amber-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span className="text-xs font-bold text-white">Admin & Executive</span>
            </div>
            <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {stats?.adminCount ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            Super Administrator with full master control over all 12 platform modules.
          </p>
        </div>

        {/* Company Management */}
        <div
          onClick={() => setSelectedDeptFilter(selectedDeptFilter === "MANAGEMENT" ? "ALL" : "MANAGEMENT")}
          className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
            selectedDeptFilter === "MANAGEMENT"
              ? "bg-purple-500/10 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/60"
              : "bg-slate-900/80 border-slate-800/90 hover:border-purple-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <span className="text-xs font-bold text-white">Company Management</span>
            </div>
            <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              {stats?.managementCount ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            Executive oversight of Dashboard, Analytics, Packages, Pricing, Sales & Suppliers.
          </p>
        </div>

        {/* Sales Executives */}
        <div
          onClick={() => setSelectedDeptFilter(selectedDeptFilter === "SALES" ? "ALL" : "SALES")}
          className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
            selectedDeptFilter === "SALES"
              ? "bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/60"
              : "bg-slate-900/80 border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">💼</span>
              <span className="text-xs font-bold text-white">Sales Executives</span>
            </div>
            <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {stats?.salesCount ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            Leads pipeline, custom quotes, booking executions, and customer relations.
          </p>
        </div>

        {/* Support & Content */}
        <div
          onClick={() => setSelectedDeptFilter(selectedDeptFilter === "SUPPORT_CONTENT" ? "ALL" : "SUPPORT_CONTENT")}
          className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
            selectedDeptFilter === "SUPPORT_CONTENT"
              ? "bg-sky-500/10 border-sky-500/60 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/60"
              : "bg-slate-900/80 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">✍️</span>
              <span className="text-xs font-bold text-white">Content & Support</span>
            </div>
            <span className="text-sm font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {stats?.supportContentCount ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            Destinations, Attractions, Tour Packages, Blogs, FAQs, Media & SEO Studio.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, role..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
          <span className="text-xs text-slate-400 mr-1 font-medium">Filter:</span>
          {[
            { key: "ALL", label: "All Staff" },
            { key: "ADMIN", label: "Admin" },
            { key: "MANAGEMENT", label: "Management" },
            { key: "SALES", label: "Sales" },
            { key: "SUPPORT_CONTENT", label: "Content/Support" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedDeptFilter(item.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDeptFilter === item.key
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[11px] text-slate-400 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5">Granted CMS Sections</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading staff accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No staff accounts match your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdmin = user.role === Role.SUPER_ADMIN || user.email === "admin@bemytraveller.com";

                  // Extract human friendly sections list
                  const authorizedSections: { id: string; name: string }[] = [];
                  if (user.permissions.includes("*") || isSuperAdmin) {
                    authorizedSections.push({ id: "all", name: "Full Master Access (12 Modules)" });
                  } else {
                    ADMIN_SECTIONS.forEach((sec) => {
                      const pKey = SECTION_PERMISSION_MAP[sec.id];
                      if (
                        user.permissions.includes(sec.id) ||
                        user.permissions.includes(pKey) ||
                        user.permissions.includes(`${sec.id}.manage`) ||
                        user.permissions.includes(`${sec.id}.view`)
                      ) {
                        authorizedSections.push({ id: sec.id, name: sec.name });
                      }
                    });
                  }

                  return (
                    <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* User identity */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 overflow-hidden shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2 text-sm">
                              {user.name}
                              {isSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        {renderDepartmentBadge(user.department)}
                      </td>

                      {/* Designation */}
                      <td className="px-5 py-3.5">
                        <span className="text-slate-300 font-medium">
                          {user.designation || (isSuperAdmin ? "Executive Administrator" : "Staff Member")}
                        </span>
                        {user.phone && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.phone}</div>}
                      </td>

                      {/* Authorized Sections */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {authorizedSections.length === 0 ? (
                            <span className="text-slate-500 italic text-[11px]">No sections granted</span>
                          ) : authorizedSections[0].id === "all" ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold text-[11px]">
                              ★ Full Platform Access (12 Modules)
                            </span>
                          ) : (
                            <>
                              {authorizedSections.slice(0, 3).map((sec) => (
                                <span
                                  key={sec.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px]"
                                >
                                  <span>{SECTION_ICONS[sec.id] || "📌"}</span>
                                  <span>{sec.name}</span>
                                </span>
                              ))}
                              {authorizedSections.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 text-[10px] font-mono">
                                  +{authorizedSections.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">{renderStatusBadge(user.status)}</td>

                      {/* Last Login */}
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Privileges & Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => {
                              setResetModalUser(user);
                              setNewPasswordInput(generateRandomPassword());
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                            title="Reset Staff Password"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>

                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete Account"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {modalMode === "CREATE" ? "Register New Staff Member" : `Edit Privileges: ${formData.name}`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select department preset & customize section-by-section Admin CMS access.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5 text-xs">
              {/* Step 1: Department Preset Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Primary Department Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: "ADMIN" as DepartmentKey, emoji: "👑", title: "Admin", desc: "Master access across all 12 modules" },
                    { key: "MANAGEMENT" as DepartmentKey, emoji: "🏢", title: "Management", desc: "Executive suite & financial operations" },
                    { key: "SALES" as DepartmentKey, emoji: "💼", title: "Sales", desc: "CRM, Leads, Quotes & Bookings" },
                    { key: "SUPPORT_CONTENT" as DepartmentKey, emoji: "✍️", title: "Content/Support", desc: "Content CMS, Media & SEO Studio" },
                  ].map((dept) => {
                    const isSelected = formData.department === dept.key;
                    return (
                      <button
                        key={dept.key}
                        type="button"
                        onClick={() => handleDepartmentChange(dept.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{dept.emoji}</span>
                            <span>{dept.title}</span>
                          </span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {dept.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Staff Identity & Custom Login Credentials */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Staff Member Profile & Login Credentials
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">CMS Login Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya@bemytraveller.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Job Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Holiday Consultant"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1 font-medium">
                      {modalMode === "CREATE" ? "CMS Password *" : "Set New Password (Optional)"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={modalMode === "CREATE" ? "Enter password..." : "Leave blank to keep current password"}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition-colors"
                      >
                        Generate Random
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Account Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="ACTIVE">Active (Can Login)</option>
                      <option value="SUSPENDED">Suspended (Access Blocked)</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Avatar URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Granular Section Privileges Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    3. Section-by-Section Privileges ({formData.selectedSections.length}/12 Modules)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllSections}
                      className="text-amber-400 hover:underline text-[11px]"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={handleClearAllSections}
                      className="text-slate-400 hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ADMIN_SECTIONS.map((sec) => {
                    const isChecked = formData.selectedSections.includes(sec.id);
                    return (
                      <label
                        key={sec.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-slate-800/90 border-amber-500/50 shadow-sm"
                            : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSection(sec.id)}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 truncate">
                              <span>{SECTION_ICONS[sec.id] || "📌"}</span>
                              <span>{sec.name}</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-tight">
                            {sec.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                  {modalMode === "CREATE" ? "Register Staff" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PASSWORD RESET MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 text-xs">
            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-slate-400 mb-4">
              Set new temporary password for <span className="text-amber-400 font-semibold">{resetModalUser.name}</span> ({resetModalUser.email}).
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">New Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newPasswordInput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
                  >
                    {copiedNotification ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResetModalUser(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickPasswordReset}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
