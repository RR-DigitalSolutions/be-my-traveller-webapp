import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/domains/cms/site-settings.model";
import { auth } from "@/lib/auth/auth";

const DEFAULT_BRANCH_OFFICES = [
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
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let settings: any = await SiteSettingsModel.findOne().lean();
    // If settings exist but still have old placeholder numbers, auto-upgrade
    if (settings && (settings.primaryPhone === "+91 98765 43210" || settings.whatsappNumber === "+91 98765 43210" || !settings.primaryPhone)) {
      await SiteSettingsModel.updateOne(
        { _id: settings._id },
        { $set: { primaryPhone: "+91 8091638090", emergencyHelpline: "+91 8091638090", whatsappNumber: "+91 8091638090" } }
      );
      settings.primaryPhone = "+91 8091638090";
      settings.emergencyHelpline = "+91 8091638090";
      settings.whatsappNumber = "+91 8091638090";
    }


    if (!settings) {
      const created = await SiteSettingsModel.create({
        companyLegalName: "Be My Traveller Holidays Private Limited",
        tradeName: "Be My Traveller",
        tagline: "Curated Experiential Mountain Holidays & Custom Tour Packages",
        watermarkText: "RRDS",
        branchOffices: DEFAULT_BRANCH_OFFICES,
      });
      settings = created.toObject();
    }

    if (!settings.branchOffices || settings.branchOffices.length === 0) {
      await SiteSettingsModel.updateOne(
        { _id: settings._id },
        { $set: { branchOffices: DEFAULT_BRANCH_OFFICES } }
      );
      settings.branchOffices = DEFAULT_BRANCH_OFFICES;
    }

    // Return settings with password masked for security if not empty
    const sanitizedSettings = {
      ...settings,
      smtp: {
        ...settings?.smtp,
        password: settings?.smtp?.password ? "••••••••••••" : "",
      },
      payments: {
        ...settings?.payments,
        razorpayKeySecret: settings?.payments?.razorpayKeySecret ? "••••••••••••" : "",
        stripeSecretKey: settings?.payments?.stripeSecretKey ? "••••••••••••" : "",
      },
      whatsappConfig: {
        ...settings?.whatsappConfig,
        apiKey: settings?.whatsappConfig?.apiKey ? "••••••••••••" : "",
      },
    };

    return NextResponse.json({
      success: true,
      settings: sanitizedSettings,
    });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform settings", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    let settings = await SiteSettingsModel.findOne();
    if (!settings) {
      settings = new SiteSettingsModel();
    }

    // Deep merge / update individual fields
    if (body.companyLegalName) settings.companyLegalName = body.companyLegalName.trim();
    if (body.tradeName) settings.tradeName = body.tradeName.trim();
    if (body.tagline) settings.tagline = body.tagline.trim();
    if (body.brandDescription !== undefined) settings.brandDescription = body.brandDescription.trim();
    if (body.logoUrl !== undefined) settings.logoUrl = body.logoUrl.trim();
    if (body.faviconUrl !== undefined) settings.faviconUrl = body.faviconUrl.trim();
    if (body.watermarkText !== undefined) settings.watermarkText = body.watermarkText.trim() || "RRDS";

    if (body.gstin !== undefined) settings.gstin = body.gstin.trim();
    if (body.pan !== undefined) settings.pan = body.pan.trim();
    if (body.cin !== undefined) settings.cin = body.cin.trim();
    if (body.iataNumber !== undefined) settings.iataNumber = body.iataNumber.trim();
    if (body.tourismLicenseNo !== undefined) settings.tourismLicenseNo = body.tourismLicenseNo.trim();
    if (body.dotPermitNo !== undefined) settings.dotPermitNo = body.dotPermitNo.trim();

    if (body.registeredOffice) {
      settings.registeredOffice = {
        ...settings.registeredOffice,
        ...body.registeredOffice,
      };
    }

    if (Array.isArray(body.branchOffices)) {
      settings.branchOffices = body.branchOffices;
    }

    if (body.primaryPhone) settings.primaryPhone = body.primaryPhone.trim();
    if (body.emergencyHelpline) settings.emergencyHelpline = body.emergencyHelpline.trim();
    if (body.whatsappNumber) settings.whatsappNumber = body.whatsappNumber.trim();
    if (body.primaryEmail) settings.primaryEmail = body.primaryEmail.trim().toLowerCase();
    if (body.supportEmail) settings.supportEmail = body.supportEmail.trim().toLowerCase();
    if (body.billingEmail) settings.billingEmail = body.billingEmail.trim().toLowerCase();
    if (body.bookingsEmail) settings.bookingsEmail = body.bookingsEmail.trim().toLowerCase();

    if (body.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...body.socialLinks,
      };
    }

    // SMTP Updates
    if (body.smtp) {
      const currentPassword = settings.smtp?.password;
      const newPassword = body.smtp.password;
      const shouldUpdatePassword = newPassword && newPassword !== "••••••••••••";

      settings.smtp = {
        ...settings.smtp,
        ...body.smtp,
        password: shouldUpdatePassword ? newPassword : currentPassword,
      };
    }

    // WhatsApp Updates
    if (body.whatsappConfig) {
      const currentKey = settings.whatsappConfig?.apiKey;
      const newKey = body.whatsappConfig.apiKey;
      const shouldUpdateKey = newKey && newKey !== "••••••••••••";

      settings.whatsappConfig = {
        ...settings.whatsappConfig,
        ...body.whatsappConfig,
        apiKey: shouldUpdateKey ? newKey : currentKey,
        autoReplies: {
          ...settings.whatsappConfig?.autoReplies,
          ...body.whatsappConfig.autoReplies,
        },
      };
    }

    // Payments Updates
    if (body.payments) {
      const currentRzpSecret = settings.payments?.razorpayKeySecret;
      const newRzpSecret = body.payments.razorpayKeySecret;
      const shouldUpdateRzpSecret = newRzpSecret && newRzpSecret !== "••••••••••••";

      const currentStripeSecret = settings.payments?.stripeSecretKey;
      const newStripeSecret = body.payments.stripeSecretKey;
      const shouldUpdateStripeSecret = newStripeSecret && newStripeSecret !== "••••••••••••";

      settings.payments = {
        ...settings.payments,
        ...body.payments,
        razorpayKeySecret: shouldUpdateRzpSecret ? newRzpSecret : currentRzpSecret,
        stripeSecretKey: shouldUpdateStripeSecret ? newStripeSecret : currentStripeSecret,
        bankTransferDetails: {
          ...settings.payments?.bankTransferDetails,
          ...body.payments.bankTransferDetails,
        },
      };
    }

    // Website & SEO Updates
    if (body.website) {
      settings.website = {
        ...settings.website,
        ...body.website,
      };
    }

    // Security Updates
    if (body.security) {
      settings.security = {
        ...settings.security,
        ...body.security,
      };
    }

    settings.updatedBy = session.user.id as any;
    settings.updatedAt = new Date();

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
      settings,
    });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update platform settings", detail: error?.message },
      { status: 500 }
    );
  }
}
