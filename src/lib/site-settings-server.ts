// ============================================================
// Server-Only Site Settings DB Fetcher
// (Kept separate from client-safe definitions to avoid bundling
// node:dns / mongoose / mongodb into client/browser bundles)
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/domains/cms/site-settings.model";
import { PublicSiteSettings, DEFAULT_PUBLIC_SETTINGS } from "@/lib/site-settings";

/**
 * Server-side direct DB fetcher for Server Components with graceful fallback.
 */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    await connectDB();

    const doc: any = await SiteSettingsModel.findOne().lean();
    if (!doc) return DEFAULT_PUBLIC_SETTINGS;

    // Self-healing migration: If DB has old placeholder numbers, auto-update to official number
    const OLD_PLACEHOLDERS = ["+91 98765 43210", "+91 98765 00000", "1800 22 7979", "+91 90000 00000"];
    let needsUpdate = false;
    let newPhone = doc.primaryPhone;
    let newEmergency = doc.emergencyHelpline;
    let newWhatsApp = doc.whatsappNumber;

    if (!newPhone || OLD_PLACEHOLDERS.includes(newPhone)) {
      newPhone = "+91 8091638090";
      needsUpdate = true;
    }
    if (!newEmergency || OLD_PLACEHOLDERS.includes(newEmergency)) {
      newEmergency = "+91 8091638090";
      needsUpdate = true;
    }
    if (!newWhatsApp || OLD_PLACEHOLDERS.includes(newWhatsApp)) {
      newWhatsApp = "+91 8091638090";
      needsUpdate = true;
    }

    if (needsUpdate && doc._id) {
      SiteSettingsModel.updateOne(
        { _id: doc._id },
        { $set: { primaryPhone: newPhone, emergencyHelpline: newEmergency, whatsappNumber: newWhatsApp } }
      ).catch(() => {});
    }

    return {
      companyLegalName: doc.companyLegalName || DEFAULT_PUBLIC_SETTINGS.companyLegalName,
      tradeName: doc.tradeName || DEFAULT_PUBLIC_SETTINGS.tradeName,
      tagline: doc.tagline || DEFAULT_PUBLIC_SETTINGS.tagline,
      brandDescription: doc.brandDescription || DEFAULT_PUBLIC_SETTINGS.brandDescription,
      logoUrl: doc.logoUrl || DEFAULT_PUBLIC_SETTINGS.logoUrl,
      faviconUrl: doc.faviconUrl || DEFAULT_PUBLIC_SETTINGS.faviconUrl,
      watermarkText: doc.watermarkText || DEFAULT_PUBLIC_SETTINGS.watermarkText,

      gstin: doc.gstin || DEFAULT_PUBLIC_SETTINGS.gstin,
      pan: doc.pan || DEFAULT_PUBLIC_SETTINGS.pan,
      cin: doc.cin || DEFAULT_PUBLIC_SETTINGS.cin,
      iataNumber: doc.iataNumber || DEFAULT_PUBLIC_SETTINGS.iataNumber,
      tourismLicenseNo: doc.tourismLicenseNo || DEFAULT_PUBLIC_SETTINGS.tourismLicenseNo,
      dotPermitNo: doc.dotPermitNo || DEFAULT_PUBLIC_SETTINGS.dotPermitNo,

      registeredOffice: {
        ...DEFAULT_PUBLIC_SETTINGS.registeredOffice,
        ...(doc.registeredOffice || {}),
      },
      branchOffices: Array.isArray(doc.branchOffices) && doc.branchOffices.length > 0
        ? doc.branchOffices
        : DEFAULT_PUBLIC_SETTINGS.branchOffices,

      primaryPhone: newPhone || DEFAULT_PUBLIC_SETTINGS.primaryPhone,
      emergencyHelpline: newEmergency || DEFAULT_PUBLIC_SETTINGS.emergencyHelpline,
      whatsappNumber: newWhatsApp || DEFAULT_PUBLIC_SETTINGS.whatsappNumber,
      primaryEmail: doc.primaryEmail || DEFAULT_PUBLIC_SETTINGS.primaryEmail,
      supportEmail: doc.supportEmail || DEFAULT_PUBLIC_SETTINGS.supportEmail,
      billingEmail: doc.billingEmail || DEFAULT_PUBLIC_SETTINGS.billingEmail,
      bookingsEmail: doc.bookingsEmail || DEFAULT_PUBLIC_SETTINGS.bookingsEmail,

      socialLinks: {
        ...DEFAULT_PUBLIC_SETTINGS.socialLinks,
        ...(doc.socialLinks || {}),
      },

      website: {
        ...DEFAULT_PUBLIC_SETTINGS.website,
        ...(doc.website || {}),
      },
    };
  } catch (error) {
    console.error("[getPublicSiteSettings Error]:", error);
    return DEFAULT_PUBLIC_SETTINGS;
  }
}
