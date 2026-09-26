"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { PublicSiteSettings, DEFAULT_PUBLIC_SETTINGS } from "@/lib/site-settings";

interface SiteSettingsContextValue {
  settings: PublicSiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  // Helper shortcuts for easy consumption
  helplinePhone: string;
  cleanPhone: string;
  cleanWhatsApp: string;
  supportEmail: string;
  bookingsEmail: string;
  fullAddress: string;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_PUBLIC_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
  helplinePhone: DEFAULT_PUBLIC_SETTINGS.primaryPhone,
  cleanPhone: DEFAULT_PUBLIC_SETTINGS.primaryPhone.replace(/\D/g, ""),
  cleanWhatsApp: DEFAULT_PUBLIC_SETTINGS.whatsappNumber.replace(/\D/g, ""),
  supportEmail: DEFAULT_PUBLIC_SETTINGS.supportEmail,
  bookingsEmail: DEFAULT_PUBLIC_SETTINGS.bookingsEmail,
  fullAddress: `${DEFAULT_PUBLIC_SETTINGS.registeredOffice.addressLine1}, ${DEFAULT_PUBLIC_SETTINGS.registeredOffice.city}, ${DEFAULT_PUBLIC_SETTINGS.registeredOffice.state} - ${DEFAULT_PUBLIC_SETTINGS.registeredOffice.pincode}`,
});

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: PublicSiteSettings;
}) {
  const [settings, setSettings] = useState<PublicSiteSettings>(
    initialSettings || DEFAULT_PUBLIC_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/settings/public", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn("[SiteSettingsContext] Failed to load latest settings, using defaults.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen to custom cross-tab or in-page update event
    const handleUpdate = () => fetchSettings();
    window.addEventListener("site_settings_updated", handleUpdate);
    return () => window.removeEventListener("site_settings_updated", handleUpdate);
  }, []);

  const value = useMemo(() => {
    const cleanPhone = (settings.primaryPhone || "").replace(/\D/g, "");
    const cleanWhatsApp = (settings.whatsappNumber || "").replace(/\D/g, "");
    const fullAddress = [
      settings.registeredOffice?.addressLine1,
      settings.registeredOffice?.addressLine2,
      settings.registeredOffice?.city,
      settings.registeredOffice?.state,
      settings.registeredOffice?.pincode,
      settings.registeredOffice?.country,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      settings,
      isLoading,
      refreshSettings: fetchSettings,
      helplinePhone: settings.primaryPhone || DEFAULT_PUBLIC_SETTINGS.primaryPhone,
      cleanPhone: cleanPhone || "918091638090",
      cleanWhatsApp: cleanWhatsApp || "918091638090",
      supportEmail: settings.supportEmail || DEFAULT_PUBLIC_SETTINGS.supportEmail,
      bookingsEmail: settings.bookingsEmail || DEFAULT_PUBLIC_SETTINGS.bookingsEmail,
      fullAddress: fullAddress || "New Delhi, India",
    };
  }, [settings, isLoading]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_PUBLIC_SETTINGS,
      isLoading: false,
      refreshSettings: async () => {},
      helplinePhone: DEFAULT_PUBLIC_SETTINGS.primaryPhone,
      cleanPhone: DEFAULT_PUBLIC_SETTINGS.primaryPhone.replace(/\D/g, ""),
      cleanWhatsApp: DEFAULT_PUBLIC_SETTINGS.whatsappNumber.replace(/\D/g, ""),
      supportEmail: DEFAULT_PUBLIC_SETTINGS.supportEmail,
      bookingsEmail: DEFAULT_PUBLIC_SETTINGS.bookingsEmail,
      fullAddress: `${DEFAULT_PUBLIC_SETTINGS.registeredOffice.addressLine1}, ${DEFAULT_PUBLIC_SETTINGS.registeredOffice.city}`,
    };
  }
  return context;
}
