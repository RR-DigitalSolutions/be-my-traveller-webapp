"use client";

import { useState, useEffect } from "react";

type SettingsTab =
  | "COMPANY"
  | "SMTP"
  | "WHATSAPP"
  | "PAYMENTS"
  | "WEBSITE"
  | "SECURITY";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("COMPANY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Test Modals State
  const [isEmailTestOpen, setIsEmailTestOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("admin@bemytraveller.com");
  const [testingEmail, setTestingEmail] = useState(false);

  const [isWaTestOpen, setIsWaTestOpen] = useState(false);
  const [testWaRecipient, setTestWaRecipient] = useState("+91 8091638090");
  const [testWaMessage, setTestWaMessage] = useState("Namaste from Be My Traveller Concierge! Your test message is verified.");
  const [testingWa, setTestingWa] = useState(false);

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    isPrimary: false,
  });

  // Master Form Data State
  const [formData, setFormData] = useState({
    // Company Profile
    companyLegalName: "Be My Traveller Holidays Private Limited",
    tradeName: "Be My Traveller",
    tagline: "Curated Experiential Mountain Holidays & Custom Tour Packages",
    brandDescription:
      "India's leading experiential luxury and mountain travel specialist, providing curated tour packages, point-to-point chauffeured fleet transfers, and bespoke holiday planning across Himachal Pradesh, Kashmir, Uttarakhand, Ladakh, Dubai, and Andaman.",
    logoUrl: "",
    faviconUrl: "",
    watermarkText: "RRDS",
    gstin: "07AAGCB1234F1Z8",
    pan: "AAGCB1234F",
    cin: "U63040DL2024PTC123456",
    iataNumber: "14-3 5678 9",
    tourismLicenseNo: "MOT/ND/2024/7891",
    dotPermitNo: "HP-DOT-9921-EXP",

    // Registered Office
    registeredOffice: {
      addressLine1: "Level 4, Connaught Place Business Tower, Barakhamba Road",
      addressLine2: "Central Delhi",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India",
    },

    // Branch Offices
    branchOffices: [
      {
        name: "Manali Ground Operations Desk",
        address: "The Mall Road, Near Circuit House, Old Manali, Himachal Pradesh 175131",
        phone: "+91 98160 11223",
        email: "manali.desk@bemytraveller.com",
        isPrimary: true,
      },
      {
        name: "Srinagar Kashmir Concierge Hub",
        address: "Boulevard Road, Opposite Ghat No. 7 Dal Lake, Srinagar, J&K 190001",
        phone: "+91 94190 44556",
        email: "kashmir.desk@bemytraveller.com",
        isPrimary: false,
      },
      {
        name: "Dubai UAE International Office",
        address: "Office 804, Business Bay Tower, Marasi Drive, Downtown Dubai, UAE",
        phone: "+971 4 398 7766",
        email: "dubai@bemytraveller.com",
        isPrimary: false,
      },
    ],

    primaryPhone: "+91 8091638090",
    emergencyHelpline: "+91 8091638090",
    whatsappNumber: "+91 8091638090",
    primaryEmail: "hello@bemytraveller.com",
    supportEmail: "support@bemytraveller.com",
    billingEmail: "accounts@bemytraveller.com",
    bookingsEmail: "bookings@bemytraveller.com",

    // Social Links
    socialLinks: {
      instagram: "https://instagram.com/bemytraveller",
      facebook: "https://facebook.com/bemytraveller",
      youtube: "https://youtube.com/@bemytraveller",
      twitter: "https://twitter.com/bemytraveller",
      linkedin: "https://linkedin.com/company/bemytraveller",
      tripadvisor: "https://tripadvisor.in/bemytraveller",
    },

    // SMTP Configuration
    smtp: {
      provider: "GMAIL" as "CUSTOM" | "GMAIL" | "SENDGRID" | "SES" | "MAILGUN" | "BREVO",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      username: "notifications@bemytraveller.com",
      password: "",
      senderName: "Be My Traveller Holidays",
      fromEmail: "noreply@bemytraveller.com",
      replyToEmail: "support@bemytraveller.com",
      emailSignature:
        "Warm Regards,\nBe My Traveller Holidays Concierge Team\n24/7 Helpline: +91 8091638090 | support@bemytraveller.com",
      isActive: true,
    },

    // WhatsApp Configuration
    whatsappConfig: {
      provider: "META_CLOUD_API" as "META_CLOUD_API" | "TWILIO" | "WATI" | "AISENSY" | "WEBHOOK",
      phoneNumberId: "109847291823749",
      businessAccountId: "782910482710394",
      apiKey: "",
      webhookSecret: "bmt_wa_wh_sec_2026",
      isActive: true,
      autoReplies: {
        instantLeadWelcome: true,
        quotePdfDelivery: true,
        bookingVoucherDispatch: true,
        driverAssignmentAlert: true,
        postTripFeedback: true,
      },
      conciergeMessageTemplate:
        "Namaste {{name}}! Welcome to Be My Traveller. Your dedicated destination specialist is curating your personalized {{destination}} itinerary. We will connect shortly with exclusive seasonal rates!",
    },

    // Payments & Taxes
    payments: {
      activeGateway: "RAZORPAY" as "RAZORPAY" | "CASHFREE" | "STRIPE" | "PAYU" | "BANK_TRANSFER",
      razorpayKeyId: "rzp_live_BMT99x88y77z",
      razorpayKeySecret: "",
      razorpayWebhookSecret: "",
      stripePublishableKey: "",
      stripeSecretKey: "",
      defaultCurrency: "INR",
      supportedCurrencies: ["INR", "USD", "AED", "EUR", "GBP"],
      advanceDepositPercent: 25,
      defaultGstPercent: 5,
      tcsInternationalPercent: 5,
      bankTransferDetails: {
        bankName: "HDFC Bank Ltd.",
        accountName: "Be My Traveller Holidays Pvt Ltd",
        accountNumber: "50200088991122",
        ifscCode: "HDFC0000240",
        branchName: "Connaught Place Branch, New Delhi",
        upiId: "bemytraveller@hdfcbank",
      },
    },

    // Website & SEO
    website: {
      isMaintenanceMode: false,
      maintenanceMessage:
        "We are currently upgrading our travel systems for a better experience. We will be back online shortly!",
      defaultMetaTitle:
        "Be My Traveller — Curated Luxury Mountain Holidays & Custom Tour Packages",
      defaultMetaDescription:
        "Discover handpicked tour packages across Manali, Kashmir, Ladakh, Shimla, Kerala, and Dubai. Enjoy 3-tier hotel stays, mountain transfers, verified activities, and 24/7 concierge.",
      googleAnalyticsId: "G-BMT8899XX",
      gtmContainerId: "GTM-BMT7722",
      metaPixelId: "192837465019283",
      googleSiteVerification: "googled9a8b7c6d5e4f3a2",
      enableCookieBanner: true,
      enableFloatingWhatsApp: true,
      enableLiveChat: true,
    },

    // Security
    security: {
      twoFactorEnforced: false,
      sessionTimeoutHours: 8,
      apiRateLimit: 120,
    },
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Current Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setFormData((prev) => ({
          ...prev,
          ...data.settings,
          registeredOffice: {
            ...prev.registeredOffice,
            ...data.settings.registeredOffice,
          },
          socialLinks: {
            ...prev.socialLinks,
            ...data.settings.socialLinks,
          },
          smtp: {
            ...prev.smtp,
            ...data.settings.smtp,
          },
          whatsappConfig: {
            ...prev.whatsappConfig,
            ...data.settings.whatsappConfig,
            autoReplies: {
              ...prev.whatsappConfig.autoReplies,
              ...data.settings.whatsappConfig?.autoReplies,
            },
          },
          payments: {
            ...prev.payments,
            ...data.settings.payments,
            bankTransferDetails: {
              ...prev.payments.bankTransferDetails,
              ...data.settings.payments?.bankTransferDetails,
            },
          },
          website: {
            ...prev.website,
            ...data.settings.website,
          },
          security: {
            ...prev.security,
            ...data.settings.security,
          },
        }));
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load settings from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ All platform settings saved and synchronized!");
        if (typeof window !== "undefined") window.dispatchEvent(new Event("site_settings_updated"));
      } else {
        showToast(data.error || "Failed to update settings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Test Email
  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/v1/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testEmailRecipient,
          smtpConfig: formData.smtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsEmailTestOpen(false);
      } else {
        showToast(data.error || "Failed to dispatch test email", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error sending test email", "error");
    } finally {
      setTestingEmail(false);
    }
  };

  // Test WhatsApp
  const handleSendTestWhatsApp = async () => {
    setTestingWa(true);
    try {
      const res = await fetch("/api/v1/admin/settings/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: testWaRecipient,
          messageText: testWaMessage,
          provider: formData.whatsappConfig.provider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsWaTestOpen(false);
      } else {
        showToast(data.error || "Failed to dispatch test WhatsApp message", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error sending test WhatsApp message", "error");
    } finally {
      setTestingWa(false);
    }
  };

  // Add Branch Office
  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.address.trim()) {
      showToast("Branch name and address are required", "error");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      branchOffices: [...prev.branchOffices, { ...newBranch }],
    }));
    setNewBranch({ name: "", address: "", phone: "", email: "", isPrimary: false });
    setIsBranchModalOpen(false);
    showToast("Branch office added to list (click Save Changes to apply)");
  };

  const handleRemoveBranch = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      branchOffices: prev.branchOffices.filter((_, i) => i !== index),
    }));
  };

  // Navigation Tabs Configuration
  const TABS = [
    { id: "COMPANY" as SettingsTab, label: "Company & Brand", icon: "🏢", badge: "Legal & Offices" },
    { id: "SMTP" as SettingsTab, label: "SMTP & Email", icon: "✉️", badge: "Delivery Gateway" },
    { id: "WHATSAPP" as SettingsTab, label: "WhatsApp API", icon: "💬", badge: "Automation Active" },
    { id: "PAYMENTS" as SettingsTab, label: "Payments & Taxes", icon: "💳", badge: "Razorpay / GST" },
    { id: "WEBSITE" as SettingsTab, label: "Website & SEO", icon: "🌐", badge: "GA4 / Tracking" },
    { id: "SECURITY" as SettingsTab, label: "Security & Backups", icon: "🔒", badge: "2FA & Policies" },
  ];

  return (
    <div className="relative min-h-full pb-24 text-slate-100 font-sans">
      {/* Hidden RRDS Watermark */}
      <div className="absolute right-4 top-1 text-[10px] text-slate-700/30 pointer-events-none font-mono select-none tracking-widest uppercase">
        {formData.watermarkText || "RRDS"}-SETTINGS-v3.0
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-xs font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/95 text-emerald-200 border-emerald-500/40"
              : "bg-rose-950/95 text-rose-200 border-rose-500/40"
          }`}
        >
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Platform Settings & Integrations</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise control center for Company Brand, SMTP Email, WhatsApp Cloud API, Payment Gateways & SEO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading || saving}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700 flex items-center gap-1.5"
            title="Reload settings from database"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save Platform Settings
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isActive
                  ? "bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{tab.icon}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div className="text-xs font-bold text-white truncate">{tab.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{tab.badge}</div>
            </button>
          );
        })}
      </div>

      {/* Main Settings Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* ============================================================ */}
        {/* TAB 1: COMPANY & BRAND PROFILE */}
        {/* ============================================================ */}
        {activeTab === "COMPANY" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🏢</span> Company & Brand Identity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Master legal business credentials, registered offices, branch operational desks, and brand slogan.
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  value={formData.companyLegalName}
                  onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trade / Brand Name *</label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hidden Watermark Text</label>
                <input
                  type="text"
                  value={formData.watermarkText}
                  onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                  placeholder="RRDS"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Overview Story</label>
                <textarea
                  rows={2}
                  value={formData.brandDescription}
                  onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Legal & Regulatory Identifiers */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📑</span> Legal & Tourism Licenses
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">CIN Number</label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">IATA License No.</label>
                  <input
                    type="text"
                    value={formData.iataNumber}
                    onChange={(e) => setFormData({ ...formData, iataNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">Ministry of Tourism Reg.</label>
                  <input
                    type="text"
                    value={formData.tourismLicenseNo}
                    onChange={(e) => setFormData({ ...formData, tourismLicenseNo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-sans mb-1">DOT Permit No.</label>
                  <input
                    type="text"
                    value={formData.dotPermitNo}
                    onChange={(e) => setFormData({ ...formData, dotPermitNo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Registered Head Office & Contact Helplines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Registered Office */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <span>📍</span> Registered Head Office
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.registeredOffice.addressLine1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registeredOffice: { ...formData.registeredOffice, addressLine1: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.registeredOffice.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registeredOffice: { ...formData.registeredOffice, city: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">State / Province</label>
                      <input
                        type="text"
                        value={formData.registeredOffice.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registeredOffice: { ...formData.registeredOffice, state: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        value={formData.registeredOffice.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registeredOffice: { ...formData.registeredOffice, pincode: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.registeredOffice.country}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registeredOffice: { ...formData.registeredOffice, country: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Helplines & Emails */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <span>📞</span> Official Helplines & Inboxes
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Primary Support Phone</label>
                    <input
                      type="text"
                      value={formData.primaryPhone}
                      onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">24/7 Mountain Helpline</label>
                    <input
                      type="text"
                      value={formData.emergencyHelpline}
                      onChange={(e) => setFormData({ ...formData, emergencyHelpline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-rose-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Official WhatsApp Contact</label>
                    <input
                      type="text"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-emerald-400 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bookings & Leads Email</label>
                    <input
                      type="email"
                      value={formData.bookingsEmail}
                      onChange={(e) => setFormData({ ...formData, bookingsEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Billing & Accounts Email</label>
                    <input
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Operational Desks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏔️</span> Branch & Ground Operational Desks ({formData.branchOffices.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1"
                >
                  + Add Ground Desk
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {formData.branchOffices.map((branch, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 relative group">
                    <button
                      onClick={() => handleRemoveBranch(idx)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 p-1 text-xs"
                      title="Remove branch"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">📍</span>
                      <h4 className="font-bold text-white text-xs">{branch.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {branch.address}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/80 pt-1.5">
                      <span>{branch.phone || "No phone"}</span>
                      <span>{branch.email || "No email"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: SMTP & EMAIL COMMUNICATION */}
        {/* ============================================================ */}
        {activeTab === "SMTP" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>✉️</span> SMTP & Email Communication Gateway
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure mail servers for automatic booking vouchers, quotes, customer notifications, and invoices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailTestOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <span>🧪</span> Send Test Email
              </button>
            </div>

            {/* Provider Picker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select SMTP Mail Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { key: "GMAIL", label: "Gmail / Google", host: "smtp.gmail.com", port: 587 },
                  { key: "SENDGRID", label: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
                  { key: "SES", label: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587 },
                  { key: "MAILGUN", label: "Mailgun", host: "smtp.mailgun.org", port: 587 },
                  { key: "BREVO", label: "Brevo (Sendinblue)", host: "smtp-relay.brevo.com", port: 587 },
                  { key: "CUSTOM", label: "Custom SMTP", host: "mail.bemytraveller.com", port: 465 },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        smtp: {
                          ...formData.smtp,
                          provider: item.key as any,
                          host: item.host,
                          port: item.port,
                        },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.smtp.provider === item.key
                        ? "bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.host}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SMTP Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">SMTP Server Host *</label>
                <input
                  type="text"
                  value={formData.smtp.host}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, host: e.target.value } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">SMTP Port *</label>
                <input
                  type="number"
                  value={formData.smtp.port}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, port: Number(e.target.value) || 587 } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Encryption Mode</label>
                <select
                  value={formData.smtp.secure ? "SSL" : "TLS"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, secure: e.target.value === "SSL" },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="TLS">STARTTLS (Port 587 / Recommended)</option>
                  <option value="SSL">SSL / TLS (Port 465)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">SMTP Username / Email *</label>
                <input
                  type="text"
                  value={formData.smtp.username}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, username: e.target.value } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">SMTP Password / App Password</label>
                <input
                  type="password"
                  value={formData.smtp.password}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, password: e.target.value } })
                  }
                  placeholder="Enter SMTP password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sender Display Name</label>
                <input
                  type="text"
                  value={formData.smtp.senderName}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, senderName: e.target.value } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">From Sender Email *</label>
                <input
                  type="email"
                  value={formData.smtp.fromEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, fromEmail: e.target.value } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reply-To Email</label>
                <input
                  type="email"
                  value={formData.smtp.replyToEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp: { ...formData.smtp, replyToEmail: e.target.value } })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">SMTP Gateway Status</label>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="smtpActive"
                    checked={formData.smtp.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, isActive: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="smtpActive" className="text-xs text-white font-medium cursor-pointer">
                    Enable Outbound Email Gateway
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-slate-400 mb-1 font-medium">HTML Email Signature & Footer Disclaimer</label>
                <textarea
                  rows={2}
                  value={formData.smtp.emailSignature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, emailSignature: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: WHATSAPP BUSINESS AUTOMATION */}
        {/* ============================================================ */}
        {activeTab === "WHATSAPP" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💬</span> WhatsApp Business Cloud API & Workflow Automation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automate instant lead engagements, PDF itinerary dispatch, and driver assignment alerts on WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWaTestOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <span>🧪</span> Send Test WhatsApp
              </button>
            </div>

            {/* Gateway Provider */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select WhatsApp Business Gateway
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: "META_CLOUD_API", label: "Meta Official Cloud API", desc: "Official Graph API via Meta Developer" },
                  { key: "WATI", label: "Wati.io", desc: "Wati WhatsApp Enterprise Partner" },
                  { key: "AISENSY", label: "AiSensy", desc: "Smart Campaign & Automation CRM" },
                  { key: "TWILIO", label: "Twilio WhatsApp", desc: "Twilio Programmable Messaging API" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        whatsappConfig: { ...formData.whatsappConfig, provider: item.key as any },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.whatsappConfig.provider === item.key
                        ? "bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{item.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">WhatsApp Phone Number ID *</label>
                <input
                  type="text"
                  value={formData.whatsappConfig.phoneNumberId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappConfig: { ...formData.whatsappConfig, phoneNumberId: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Business Account ID (WABA ID) *</label>
                <input
                  type="text"
                  value={formData.whatsappConfig.businessAccountId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappConfig: { ...formData.whatsappConfig, businessAccountId: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">System User Permanent Token / API Key</label>
                <input
                  type="password"
                  value={formData.whatsappConfig.apiKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappConfig: { ...formData.whatsappConfig, apiKey: e.target.value },
                    })
                  }
                  placeholder="Enter Meta Cloud API token"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 5 Automated Workflow Triggers */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Automated WhatsApp Triggers & Webhook Dispatches
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    key: "instantLeadWelcome" as const,
                    title: "Instant Lead Welcome Message",
                    desc: "Triggers within 60 seconds of inquiry submission on Website.",
                  },
                  {
                    key: "quotePdfDelivery" as const,
                    title: "Quote Proposal & PDF Dispatch",
                    desc: "Sends generated itemized travel quotation directly to client.",
                  },
                  {
                    key: "bookingVoucherDispatch" as const,
                    title: "Confirmed Booking Voucher & Receipt",
                    desc: "Automated hotel and itinerary voucher on advance deposit.",
                  },
                  {
                    key: "driverAssignmentAlert" as const,
                    title: "Chauffeur & Vehicle Alert (2h Prior)",
                    desc: "Sends driver name, car number, and live tracking contact.",
                  },
                  {
                    key: "postTripFeedback" as const,
                    title: "Post-Trip Review & Feedback",
                    desc: "Sends TripAdvisor & Google Review link 24 hours after tour end.",
                  },
                ].map((trigger) => {
                  const isEnabled = formData.whatsappConfig.autoReplies[trigger.key];
                  return (
                    <label
                      key={trigger.key}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isEnabled
                          ? "bg-slate-800/90 border-emerald-500/50 shadow-sm"
                          : "bg-slate-950/40 border-slate-800 hover:bg-slate-900/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsappConfig: {
                              ...formData.whatsappConfig,
                              autoReplies: {
                                ...formData.whatsappConfig.autoReplies,
                                [trigger.key]: e.target.checked,
                              },
                            },
                          })
                        }
                        className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{trigger.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {trigger.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <label className="block text-slate-400 mb-1 font-medium">Default Welcome WhatsApp Message Template</label>
              <textarea
                rows={3}
                value={formData.whatsappConfig.conciergeMessageTemplate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappConfig: {
                      ...formData.whatsappConfig,
                      conciergeMessageTemplate: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PAYMENTS, TAXES & CURRENCIES */}
        {/* ============================================================ */}
        {activeTab === "PAYMENTS" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💳</span> Payment Gateways, Taxes & Booking Policies
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure Razorpay/Stripe credentials, partial booking advance %, GST/TCS tax rates, and NEFT/IMPS bank accounts.
              </p>
            </div>

            {/* Gateway Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Active Online Payment Gateway
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: "RAZORPAY", label: "Razorpay (Cards, UPI, NetBanking)", badge: "India Preferred" },
                  { key: "CASHFREE", label: "Cashfree Payments", badge: "Auto Settlements" },
                  { key: "STRIPE", label: "Stripe International", badge: "Global Cards / USD" },
                  { key: "BANK_TRANSFER", label: "Bank Wire / NEFT / IMPS", badge: "Direct RTGS" },
                ].map((gw) => (
                  <button
                    key={gw.key}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        payments: { ...formData.payments, activeGateway: gw.key as any },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.payments.activeGateway === gw.key
                        ? "bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{gw.label}</div>
                    <div className="text-[10px] text-amber-400 font-medium">{gw.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs font-mono">
              <div>
                <label className="block text-slate-400 font-sans mb-1">Razorpay Key ID *</label>
                <input
                  type="text"
                  value={formData.payments.razorpayKeyId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payments: { ...formData.payments, razorpayKeyId: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={formData.payments.razorpayKeySecret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payments: { ...formData.payments, razorpayKeySecret: e.target.value },
                    })
                  }
                  placeholder="Enter Razorpay Secret"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans mb-1">Razorpay Webhook Secret</label>
                <input
                  type="password"
                  value={formData.payments.razorpayWebhookSecret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payments: { ...formData.payments, razorpayWebhookSecret: e.target.value },
                    })
                  }
                  placeholder="Enter Webhook Secret"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Financial Parameters & Tax Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Booking Advance Deposit (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.payments.advanceDepositPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          advanceDepositPercent: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 accent-amber-500"
                  />
                  <span className="font-bold font-mono text-amber-400 text-sm w-12 text-right">
                    {formData.payments.advanceDepositPercent}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Minimum partial advance required from client to lock package reservation.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Default Tour GST Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.payments.defaultGstPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          defaultGstPercent: Number(e.target.value) || 5,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Standard 5% GST on Indian Tour Packages.</p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">TCS Rate for Outbound Tours (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.payments.tcsInternationalPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          tcsInternationalPercent: Number(e.target.value) || 5,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Tax Collected at Source on International bookings.</p>
              </div>
            </div>

            {/* Bank Transfer Details for Invoices & Quotes */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <h3 className="font-bold text-white mb-3 flex items-center gap-1.5">
                <span>🏦</span> Official Bank Account for Wire Transfers & Invoices
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bank Name</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            bankName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Account Beneficiary Name</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.accountName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            accountName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Account Number</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            ifscCode: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Branch Location</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.branchName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            branchName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Official UPI ID / VPA</label>
                  <input
                    type="text"
                    value={formData.payments.bankTransferDetails.upiId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payments: {
                          ...formData.payments,
                          bankTransferDetails: {
                            ...formData.payments.bankTransferDetails,
                            upiId: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: WEBSITE CONTROLS & SEO */}
        {/* ============================================================ */}
        {activeTab === "WEBSITE" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🌐</span> Website Controls, Analytics & Tracking
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintenance mode toggle, Google Analytics 4, Tag Manager, Meta Pixel, and Floating WhatsApp widget.
              </p>
            </div>

            {/* Maintenance Mode Toggle */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                formData.website.isMaintenanceMode
                  ? "bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <div>
                    <h3 className="font-bold text-white text-xs">Emergency Maintenance Mode</h3>
                    <p className="text-[11px] text-slate-400">
                      When active, visitors will see the maintenance banner. Admin CMS remains accessible.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.website.isMaintenanceMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, isMaintenanceMode: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {formData.website.isMaintenanceMode && (
                <div className="mt-3 pt-3 border-t border-rose-500/20">
                  <label className="block text-[11px] text-rose-300 mb-1 font-medium">Custom Maintenance Message</label>
                  <input
                    type="text"
                    value={formData.website.maintenanceMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, maintenanceMessage: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-1.5 text-xs text-rose-200 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Tracking IDs */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📊</span> Analytics & Conversion Pixels
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <label className="block text-[11px] text-slate-400 font-sans mb-1">Google Analytics 4 (GA4)</label>
                  <input
                    type="text"
                    value={formData.website.googleAnalyticsId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, googleAnalyticsId: e.target.value },
                      })
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-sans mb-1">Google Tag Manager (GTM)</label>
                  <input
                    type="text"
                    value={formData.website.gtmContainerId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, gtmContainerId: e.target.value },
                      })
                    }
                    placeholder="GTM-XXXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-sans mb-1">Meta / Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={formData.website.metaPixelId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, metaPixelId: e.target.value },
                      })
                    }
                    placeholder="192837465019283"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-sans mb-1">Search Console Verification</label>
                  <input
                    type="text"
                    value={formData.website.googleSiteVerification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        website: { ...formData.website, googleSiteVerification: e.target.value },
                      })
                    }
                    placeholder="googled9a8b7c6d5e4f3a2"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* UI Widget Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: "enableFloatingWhatsApp" as const,
                  title: "Floating WhatsApp Quick Contact",
                  desc: "Displays the floating green WhatsApp button on bottom-right of customer pages.",
                },
                {
                  key: "enableCookieBanner" as const,
                  title: "GDPR & DPDP Cookie Consent Banner",
                  desc: "Prompts first-time visitors for cookie approval in compliance with privacy laws.",
                },
                {
                  key: "enableLiveChat" as const,
                  title: "Live Concierge Assistant Widget",
                  desc: "Enables instant package enquiry assistant on desktop & mobile viewports.",
                },
              ].map((widget) => {
                const isChecked = formData.website[widget.key];
                return (
                  <label
                    key={widget.key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-slate-800/90 border-amber-500/50 shadow-sm"
                        : "bg-slate-950/40 border-slate-800 hover:bg-slate-900/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          website: { ...formData.website, [widget.key]: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{widget.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {widget.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: SECURITY & BACKUPS */}
        {/* ============================================================ */}
        {activeTab === "SECURITY" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🔒</span> Security Policies & Data Backups
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Two-factor authentication enforcement, session duration limits, and automated database snapshot exports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Session Timeout (Hours)</label>
                <select
                  value={formData.security.sessionTimeoutHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        sessionTimeoutHours: Number(e.target.value) || 8,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours (Default)</option>
                  <option value={24}>24 Hours</option>
                  <option value={168}>7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">API Rate Limit (Req/Min)</label>
                <input
                  type="number"
                  value={formData.security.apiRateLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        apiRateLimit: Number(e.target.value) || 120,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Two-Factor Auth Policy</label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="enforce2fa"
                    checked={formData.security.twoFactorEnforced}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        security: { ...formData.security, twoFactorEnforced: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="enforce2fa" className="text-xs text-white font-medium cursor-pointer">
                    Enforce 2FA for Staff Logins
                  </label>
                </div>
              </div>
            </div>

            {/* Database Backup Export */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>💾</span> Platform Database Snapshot Export
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Download a complete structured JSON archive of all site settings, package templates, destinations, and configurations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
                  const downloadAnchor = document.createElement("a");
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `bmt_platform_settings_backup_${new Date().toISOString().split("T")[0]}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  showToast("Platform backup JSON exported successfully!");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 shrink-0 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON Backup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: TEST EMAIL */}
      {/* ============================================================ */}
      {isEmailTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 text-xs">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>✉️</span> Send Test Email
            </h3>
            <p className="text-slate-400 mb-4">
              Send a live test dispatch through <span className="text-amber-400 font-semibold">{formData.smtp.host}:{formData.smtp.port}</span> to verify SMTP handshake.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Recipient Email Address *</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEmailTestOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {testingEmail && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                {testingEmail ? "Sending..." : "Dispatch Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TEST WHATSAPP */}
      {/* ============================================================ */}
      {isWaTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 text-xs">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>💬</span> Send Test WhatsApp Message
            </h3>
            <p className="text-slate-400 mb-4">
              Dispatch a verified test message using <span className="text-emerald-400 font-semibold">{formData.whatsappConfig.provider}</span>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Mobile Number (with Country Code) *</label>
                <input
                  type="text"
                  value={testWaRecipient}
                  onChange={(e) => setTestWaRecipient(e.target.value)}
                  placeholder="+91 8091638090"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Message Body</label>
                <textarea
                  rows={2}
                  value={testWaMessage}
                  onChange={(e) => setTestWaMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWaTestOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTestWhatsApp}
                disabled={testingWa}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {testingWa && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                {testingWa ? "Dispatching..." : "Send WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD BRANCH OFFICE */}
      {/* ============================================================ */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 text-xs">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>📍</span> Add Ground Operational Desk
            </h3>
            <p className="text-slate-400 mb-4">
              Add a regional office or ground concierge hub for itinerary vouchers and contact cards.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Branch Desk Name *</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="e.g. Leh Ladakh Operations Hub"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Address *</label>
                <input
                  type="text"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder="Street, City, State, PIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Desk Phone</label>
                  <input
                    type="text"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    placeholder="+91 98160..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Desk Email</label>
                  <input
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    placeholder="desk@bemytraveller.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBranch}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
              >
                Add Ground Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
