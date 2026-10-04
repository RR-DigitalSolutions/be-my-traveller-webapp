"use client";

import Link from "next/link";
import Image from "next/image";
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
  const { settings, helplinePhone, cleanPhone, cleanWhatsApp, supportEmail, bookingsEmail, fullAddress } = useSiteSettings();

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
  
  const bookingsMail = bookingsEmail || settings.bookingsEmail || "bookings@bemytraveller.com";
  const hasBookingsEmail = Boolean(bookingsMail && bookingsMail.trim());
  const hasSupportEmail = Boolean(supportEmail && supportEmail.trim());
  const hasAddress = Boolean(fullAddress && fullAddress.trim());

  const hasInstagram = Boolean(settings.socialLinks?.instagram && settings.socialLinks.instagram.trim());
  const hasFacebook = Boolean(settings.socialLinks?.facebook && settings.socialLinks.facebook.trim());
  const hasYouTube = Boolean(settings.socialLinks?.youtube && settings.socialLinks.youtube.trim());
  const hasAnySocial = hasInstagram || hasFacebook || hasYouTube;

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-6 pb-8 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── TOP SECTION: Balanced 2-Card Equal-Height Compact Layout ── */}
        <div className="grid gap-4 lg:grid-cols-2 text-[11px] text-slate-300 items-stretch">
          
          {/* Card 1: Registered Head Office & Corporate Desks */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5 sm:p-4 shadow-lg backdrop-blur-xs flex flex-col justify-between space-y-2.5 h-full">
            <div className="space-y-2">
              {/* Header without 'Verified Desk' */}
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Registered Head Office &amp; Desks
                </h4>
              </div>

              {/* Office Address Tile */}
              {hasAddress && (
                <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 hover:border-amber-500/40 transition-colors">
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Registered Head Office</p>
                  <p className="font-medium text-slate-200 leading-snug mt-0.5 text-[11.5px] flex items-start gap-1.5">
                    <span className="text-red-400 shrink-0">📍</span>
                    <span>{fullAddress}</span>
                  </p>
                </div>
              )}

              {/* Corporate Inboxes: Bookings Email & Support Email */}
              {(hasBookingsEmail || hasSupportEmail) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hasBookingsEmail && (
                    <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 hover:border-amber-500/40 transition-colors">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Bookings &amp; Quotes</p>
                      <a
                        href={`mailto:${bookingsMail}`}
                        className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 mt-0.5 text-[11.5px] break-all"
                      >
                        <span>✉</span> {bookingsMail}
                      </a>
                    </div>
                  )}

                  {hasSupportEmail && (
                    <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 hover:border-amber-500/40 transition-colors">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Customer Support</p>
                      <a
                        href={`mailto:${supportEmail}`}
                        className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5 mt-0.5 text-[11.5px] break-all"
                      >
                        <span className="text-amber-400">✉</span> {supportEmail}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Subtext Row matching right card */}
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9.5px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>🏢</span> Operational Ground Office
              </span>
              <span className="text-slate-400">Verified OTA Travel Agency</span>
            </div>
          </div>

          {/* Card 2: 24/7 Helplines & Compact Instant Callback */}
          <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950 p-3.5 sm:p-4 shadow-xl flex flex-col justify-between space-y-2.5 h-full">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 text-xs">⚡</span>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Quick Help &amp; Instant Callback
                  </h4>
                </div>
                <span className="text-[9.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  Under 15 Mins
                </span>
              </div>

              {/* Direct Calling & WhatsApp Contact Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hasPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">24/7 Helpline</p>
                      <p className="font-bold text-white group-hover:text-amber-400 transition-colors text-[11.5px] sm:text-xs flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400 text-xs">📞</span> {helplinePhone}
                      </p>
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 px-2 py-0.5 rounded-md transition-colors border border-slate-800 shadow-xs">
                      Call
                    </span>
                  </a>
                )}

                {hasWhatsApp && (
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Official WhatsApp</p>
                      <p className="font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors text-[11.5px] sm:text-xs flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs">💬</span> {whatsappNum}
                      </p>
                    </div>
                    <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-slate-950 px-2 py-0.5 rounded-md transition-colors border border-emerald-500/30 shadow-xs">
                      Chat
                    </span>
                  </a>
                )}
              </div>

              {/* Compact Callback Form with Phone + Preferred Calling Time */}
              <form action="/contact" method="get" className="space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1.1fr_auto] gap-1.5 items-center">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />
                  <select
                    name="preferredTime"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="immediate">Call: Immediate (Now)</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shrink-0 shadow-md shadow-amber-500/20 cursor-pointer active:scale-98 text-center whitespace-nowrap"
                  >
                    Call Me
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Subtext Row */}
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9.5px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>🔒</span> 100% Privacy Guaranteed
              </span>
              <span className="text-slate-400">Free Vacation Consultation</span>
            </div>
          </div>
        </div>

        {/* ── MIDDLE SECTION: Main 5-Column Navigation Grid ── */}
        <div className="pt-7 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-7">
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Domestic Holidays</h4>
            <ul className="space-y-1.5 text-[11px]">
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

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">International Tours</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/destination/dubai-tour-packages" className="hover:text-amber-400 transition-colors">Dubai Tour Packages</Link></li>
              <li><Link href="/destination/bali-tour-packages" className="hover:text-amber-400 transition-colors">Bali Honeymoon Packages</Link></li>
              <li><Link href="/destination/thailand-tour-packages" className="hover:text-amber-400 transition-colors">Thailand Beach Holidays</Link></li>
              <li><Link href="/destination/vietnam-tour-packages" className="hover:text-amber-400 transition-colors">Vietnam &amp; Ha Long Bay</Link></li>
              <li><Link href="/destination/singapore-tour-packages" className="hover:text-amber-400 transition-colors">Singapore &amp; Sentosa</Link></li>
              <li><Link href="/destination/maldives-tour-packages" className="hover:text-amber-400 transition-colors">Maldives Overwater Villas</Link></li>
              <li><Link href="/destination/europe-tour-packages" className="hover:text-amber-400 transition-colors">Europe Grand Tours</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Holiday Themes</h4>
            <ul className="space-y-1.5 text-[11px]">
              {themes.slice(0, 6).map((theme) => (
                <li key={theme.slug}>
                  <Link href={buildThemeHref(theme.name)} className="hover:text-amber-400 transition-colors">
                    {theme.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company &amp; Legal</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About {settings.tradeName || "Be My Traveller"}</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact &amp; Branch Desks</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation &amp; Refund</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Secure Booking</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              256-Bit SSL Encrypted checkout. Authorized payments through Razorpay, UPI, Visa, Mastercard, and Net Banking.
            </p>
            <div className="pt-1.5 flex flex-wrap gap-2 text-slate-300 font-bold text-[10px]">
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">VISA</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">UPI</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">Net Banking</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM STRIP: Copyright, Brand Logo (in center), Socials & Watermark ── */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-center md:text-left">
            <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              B
            </span>
            <span>
              © {new Date().getFullYear()} {settings.companyLegalName || "Be My Traveller Holidays Private Limited"}. All rights reserved.
            </span>
          </div>

          {/* Brand Logo in center after Copyright, aligned in same line */}
          <div className="flex items-center justify-center">
            <Link href="/" className="inline-flex items-center justify-center" aria-label="Be My Traveller — Home">
              <div className="relative w-[130px] h-[26px] sm:w-[150px] sm:h-[30px] rounded-md bg-white px-2 py-0.5 overflow-hidden shadow-2xs">
                <Image
                  src="/Logo for website PNG.webp"
                  alt={settings.tradeName || "Be My Traveller"}
                  fill
                  className="object-contain"
                  sizes="150px"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Socials & Technology Partner */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
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
