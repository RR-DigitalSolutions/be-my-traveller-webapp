"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildThemeHref } from "@/lib/site-themes";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const defaultThemes = [
  { slug: "honeymoon", name: "HONEYMOON", label: "Honeymoon & Romance" },
  { slug: "adventure", name: "ADVENTURE", label: "Adventure & Trekking" },
  { slug: "family", name: "FAMILY", label: "Family Holidays" },
  { slug: "heritage", name: "HERITAGE", label: "Heritage & Culture" },
  { slug: "luxury", name: "LUXURY", label: "Luxury Escapes" },
  { slug: "beach", name: "BEACH", label: "Beach & Island Getaways" },
];

export default function SiteFooter() {
  const [themes, setThemes] = useState(defaultThemes);
  const { settings, helplinePhone, cleanPhone, cleanWhatsApp, supportEmail, fullAddress } = useSiteSettings();

  useEffect(() => {
    let isMounted = true;

    const loadThemes = async () => {
      try {
        const response = await fetch("/api/v1/themes");
        if (!response.ok) return;
        const data = await response.json();
        const apiThemes = Array.isArray(data.themes) ? data.themes : [];
        if (!isMounted || apiThemes.length === 0) return;

        const nextThemes = apiThemes
          .filter((theme: any) => theme.isActive !== false)
          .map((theme: any) => ({
            slug: String(theme.slug || theme.name || ""),
            name: String(theme.name || theme.slug || "").toUpperCase(),
            label: String(theme.label || theme.name || theme.slug || ""),
          }));

        if (nextThemes.length > 0) {
          setThemes(nextThemes);
        }
      } catch (error) {
        console.warn("Unable to load footer themes.", error);
      }
    };

    loadThemes();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasPhone = Boolean(helplinePhone && helplinePhone.trim());
  const whatsappNum = settings.whatsappNumber || helplinePhone;
  const hasWhatsApp = Boolean(whatsappNum && whatsappNum.trim());
  const hasEmail = Boolean(supportEmail && supportEmail.trim());
  const hasAddress = Boolean(fullAddress && fullAddress.trim());

  const hasGstin = Boolean(settings.gstin && settings.gstin.trim());
  const hasCin = Boolean(settings.cin && settings.cin.trim());
  const hasIata = Boolean(settings.iataNumber && settings.iataNumber.trim());
  const hasTourismLicense = Boolean(settings.tourismLicenseNo && settings.tourismLicenseNo.trim());
  const hasAnyLicense = hasGstin || hasCin || hasIata || hasTourismLicense;

  const hasInstagram = Boolean(settings.socialLinks?.instagram && settings.socialLinks.instagram.trim());
  const hasFacebook = Boolean(settings.socialLinks?.facebook && settings.socialLinks.facebook.trim());
  const hasYouTube = Boolean(settings.socialLinks?.youtube && settings.socialLinks.youtube.trim());
  const hasAnySocial = hasInstagram || hasFacebook || hasYouTube;

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-10 pb-8 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ── TOP SECTION: Official Contact, Head Office & Instant Callback Bar ── */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] text-[11.5px] text-slate-300">
          {/* Left Column: Official Contact & Registered Office */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 sm:p-5 shadow-lg backdrop-blur-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
                <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
                  Official Contact &amp; Registered Office
                </h4>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md">
                Verified Desk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              {hasPhone && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/60 p-3 hover:border-amber-500/40 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">24/7 Primary Helpline</p>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5 mt-1 text-xs sm:text-[13px]"
                  >
                    <span className="text-amber-400">📞</span> {helplinePhone}
                  </a>
                </div>
              )}

              {hasWhatsApp && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/60 p-3 hover:border-emerald-500/40 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Official WhatsApp</p>
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 mt-1 text-xs sm:text-[13px]"
                  >
                    <span>💬</span> {whatsappNum}
                  </a>
                </div>
              )}

              {hasEmail && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/60 p-3 hover:border-amber-500/40 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Support &amp; Inquiries</p>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5 mt-1 break-all text-xs"
                  >
                    <span className="text-amber-400">✉</span> {supportEmail}
                  </a>
                </div>
              )}

              {hasAddress && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/60 p-3 hover:border-amber-500/40 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Registered Head Office</p>
                  <p className="font-medium text-slate-300 leading-snug mt-1 text-xs flex items-start gap-1.5">
                    <span className="text-red-400 shrink-0">📍</span>
                    <span>{fullAddress}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Government Licenses Badges (Only shown if admin populated) */}
            {hasAnyLicense && (
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                {hasGstin && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                    GSTIN: <strong className="text-amber-400 font-mono">{settings.gstin}</strong>
                  </span>
                )}
                {hasCin && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                    CIN: <strong className="text-slate-300 font-mono">{settings.cin}</strong>
                  </span>
                )}
                {hasIata && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                    IATA: <strong className="text-slate-300 font-mono">{settings.iataNumber}</strong>
                  </span>
                )}
                {hasTourismLicense && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                    MOT: <strong className="text-slate-300 font-mono">{settings.tourismLicenseNo}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Quick Callback Form */}
          <form
            action="/contact"
            method="get"
            className="space-y-3 rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-amber-400">⚡</span> Request Instant Callback
                </h4>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  Under 15 Mins
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enter your mobile number and our verified holiday specialist will call you back with customized quotes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your 10-digit mobile number"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shrink-0 shadow-md shadow-amber-500/20 cursor-pointer active:scale-98"
                >
                  Call Me
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center sm:text-left flex items-center gap-1">
                <span>🔒</span> 100% Privacy Guaranteed · Zero Spam Calls
              </p>
            </div>
          </form>
        </div>

        {/* ── MIDDLE SECTION: Main 5-Column Navigation Grid ── */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Domestic Holidays</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/destination/india/himachal-tour-packages" className="hover:text-amber-400 transition-colors">Himachal Tour Packages</Link></li>
              <li><Link href="/destination/india/kashmir-tour-packages" className="hover:text-amber-400 transition-colors">Kashmir Holiday Packages</Link></li>
              <li><Link href="/destination/india/kerala-tour-packages" className="hover:text-amber-400 transition-colors">Kerala Backwaters Tours</Link></li>
              <li><Link href="/destination/india/rajasthan-tour-packages" className="hover:text-amber-400 transition-colors">Rajasthan Forts &amp; Palaces</Link></li>
              <li><Link href="/destination/india/goa-tour-packages" className="hover:text-amber-400 transition-colors">Goa Beach Packages</Link></li>
              <li><Link href="/destination/india/andaman-tour-packages" className="hover:text-amber-400 transition-colors">Andaman Islands Scuba</Link></li>
              <li><Link href="/destination/india/ladakh-tour-packages" className="hover:text-amber-400 transition-colors">Ladakh &amp; Spiti Roadtrips</Link></li>
              <li><Link href="/destination/india/uttarakhand-tour-packages" className="hover:text-amber-400 transition-colors">Uttarakhand Spiritual Circuits</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">International Tours</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/destination/dubai-tour-packages" className="hover:text-amber-400 transition-colors">Dubai Tour Packages</Link></li>
              <li><Link href="/destination/bali-tour-packages" className="hover:text-amber-400 transition-colors">Bali Honeymoon Packages</Link></li>
              <li><Link href="/destination/thailand-tour-packages" className="hover:text-amber-400 transition-colors">Thailand Beach Holidays</Link></li>
              <li><Link href="/destination/vietnam-tour-packages" className="hover:text-amber-400 transition-colors">Vietnam &amp; Ha Long Bay</Link></li>
              <li><Link href="/destination/singapore-tour-packages" className="hover:text-amber-400 transition-colors">Singapore &amp; Sentosa</Link></li>
              <li><Link href="/destination/maldives-tour-packages" className="hover:text-amber-400 transition-colors">Maldives Overwater Villas</Link></li>
              <li><Link href="/destination/europe-tour-packages" className="hover:text-amber-400 transition-colors">Europe Grand Tours</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Holiday Themes</h4>
            <ul className="space-y-2 text-[11px]">
              {themes.slice(0, 6).map((theme) => (
                <li key={theme.slug}>
                  <Link href={buildThemeHref(theme.name)} className="hover:text-amber-400 transition-colors">
                    {theme.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company &amp; Legal</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About {settings.tradeName || "Be My Traveller"}</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact &amp; Branch Desks</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation &amp; Refund</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Secure Booking</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              256-Bit SSL Encrypted checkout. Authorized payments through Razorpay, UPI, Visa, Mastercard, and Net Banking.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-slate-300 font-bold text-[10px]">
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">VISA</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">UPI</span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Net Banking</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM STRIP: Copyright, Socials & Watermark ── */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              B
            </span>
            <span>
              © {new Date().getFullYear()} {settings.companyLegalName || "Be My Traveller Holidays Private Limited"}. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {hasInstagram && (
              <a href={settings.socialLinks!.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                Instagram
              </a>
            )}
            {hasFacebook && (
              <a href={settings.socialLinks!.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                Facebook
              </a>
            )}
            {hasYouTube && (
              <a href={settings.socialLinks!.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                YouTube
              </a>
            )}
            {hasAnySocial && <span className="text-slate-700">|</span>}
            <span>Technology Partner {settings.watermarkText || "RRDS"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
