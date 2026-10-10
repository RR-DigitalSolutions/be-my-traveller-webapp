"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Link from "next/link";
import Image from "next/image";

interface ChildPlace {
  name: string;
  slug: string;
  url: string;
  count: string;
  isHot?: boolean;
}

interface StateDestination {
  name: string;
  stateSlug: string;
  url: string;
  count: string;
  isHot?: boolean;
  places: ChildPlace[];
}

interface BmtNavMenuProps {
  variant?: "transparent" | "solid";
}

export default function BmtNavMenu({ variant = "transparent" }: BmtNavMenuProps) {
  const { settings, helplinePhone, cleanPhone, cleanWhatsApp, supportEmail } = useSiteSettings();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>("india");
  const [mobileExpandedState, setMobileExpandedState] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const isSolid = isScrolled || variant === "solid";

  // Scroll detection for transparent-to-solid navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // ── Hierarchical India Destinations (State -> Multiple Places) ──
  const indiaRegions: Record<string, StateDestination[]> = {
    "North India": [
      {
        name: "Himachal Pradesh",
        stateSlug: "himachal",
        url: "/destination/india/himachal-tour-packages",
        count: "24 Tours",
        isHot: true,
        places: [
          { name: "Manali", slug: "manali", url: "/destination/india/himachal/manali-tour-packages", count: "12 Tours", isHot: true },
          { name: "Shimla", slug: "shimla", url: "/destination/india/himachal/shimla-tour-packages", count: "8 Tours" },
          { name: "Dharamshala", slug: "dharamshala", url: "/destination/india/himachal/dharamshala-tour-packages", count: "6 Tours" },
          { name: "Spiti Valley", slug: "spiti", url: "/destination/india/himachal/spiti-tour-packages", count: "5 Tours" },
          { name: "Kasol", slug: "kasol", url: "/destination/india/himachal/kasol-tour-packages", count: "4 Tours" },
          { name: "Dalhousie", slug: "dalhousie", url: "/destination/india/himachal/dalhousie-tour-packages", count: "5 Tours" },
        ],
      },
      {
        name: "Jammu & Kashmir",
        stateSlug: "kashmir",
        url: "/destination/india/kashmir-tour-packages",
        count: "18 Tours",
        isHot: true,
        places: [
          { name: "Gulmarg", slug: "gulmarg", url: "/destination/india/kashmir/gulmarg-tour-packages", count: "8 Tours", isHot: true },
          { name: "Srinagar", slug: "srinagar", url: "/destination/india/kashmir/srinagar-tour-packages", count: "10 Tours" },
          { name: "Pahalgam", slug: "pahalgam", url: "/destination/india/kashmir/pahalgam-tour-packages", count: "6 Tours" },
          { name: "Sonamarg", slug: "sonamarg", url: "/destination/india/kashmir/sonamarg-tour-packages", count: "4 Tours" },
        ],
      },
      {
        name: "Uttarakhand",
        stateSlug: "uttarakhand",
        url: "/destination/india/uttarakhand-tour-packages",
        count: "14 Tours",
        places: [
          { name: "Rishikesh", slug: "rishikesh", url: "/destination/india/uttarakhand/rishikesh-tour-packages", count: "7 Tours" },
          { name: "Nainital", slug: "nainital", url: "/destination/india/uttarakhand/nainital-tour-packages", count: "6 Tours" },
          { name: "Mussoorie", slug: "mussoorie", url: "/destination/india/uttarakhand/mussoorie-tour-packages", count: "5 Tours" },
          { name: "Jim Corbett", slug: "jimcorbett", url: "/destination/india/uttarakhand/jimcorbett-tour-packages", count: "4 Tours" },
          { name: "Kedarnath", slug: "kedarnath", url: "/destination/india/uttarakhand/kedarnath-tour-packages", count: "4 Tours" },
        ],
      },
    ],
    "South India": [
      {
        name: "Kerala Backwaters",
        stateSlug: "kerala",
        url: "/destination/india/kerala-tour-packages",
        count: "21 Tours",
        isHot: true,
        places: [
          { name: "Munnar", slug: "munnar", url: "/destination/india/kerala/munnar-tour-packages", count: "9 Tours", isHot: true },
          { name: "Alleppey", slug: "alleppey", url: "/destination/india/kerala/alleppey-tour-packages", count: "11 Tours" },
          { name: "Wayanad", slug: "wayanad", url: "/destination/india/kerala/wayanad-tour-packages", count: "5 Tours" },
          { name: "Thekkady", slug: "thekkady", url: "/destination/india/kerala/thekkady-tour-packages", count: "5 Tours" },
          { name: "Kovalam", slug: "kovalam", url: "/destination/india/kerala/kovalam-tour-packages", count: "6 Tours" },
        ],
      },
      {
        name: "Karnataka",
        stateSlug: "karnataka",
        url: "/destination/india/karnataka-tour-packages",
        count: "11 Tours",
        places: [
          { name: "Coorg", slug: "coorg", url: "/destination/india/karnataka/coorg-tour-packages", count: "6 Tours" },
          { name: "Mysore", slug: "mysore", url: "/destination/india/karnataka/mysore-tour-packages", count: "4 Tours" },
          { name: "Hampi", slug: "hampi", url: "/destination/india/karnataka/hampi-tour-packages", count: "4 Tours" },
          { name: "Chikmagalur", slug: "chikmagalur", url: "/destination/india/karnataka/chikmagalur-tour-packages", count: "3 Tours" },
        ],
      },
      {
        name: "Tamil Nadu",
        stateSlug: "tamil-nadu",
        url: "/destination/india/tamil-nadu-tour-packages",
        count: "14 Tours",
        places: [
          { name: "Ooty", slug: "ooty", url: "/destination/india/tamil-nadu/ooty-tour-packages", count: "8 Tours" },
          { name: "Kodaikanal", slug: "kodaikanal", url: "/destination/india/tamil-nadu/kodaikanal-tour-packages", count: "5 Tours" },
          { name: "Rameshwaram", slug: "rameshwaram", url: "/destination/india/tamil-nadu/rameshwaram-tour-packages", count: "6 Tours" },
          { name: "Madurai", slug: "madurai", url: "/destination/india/tamil-nadu/madurai-tour-packages", count: "4 Tours" },
        ],
      },
    ],
    "West & Central": [
      {
        name: "Royal Rajasthan",
        stateSlug: "rajasthan",
        url: "/destination/india/rajasthan-tour-packages",
        count: "16 Tours",
        isHot: true,
        places: [
          { name: "Jaipur", slug: "jaipur", url: "/destination/india/rajasthan/jaipur-tour-packages", count: "11 Tours", isHot: true },
          { name: "Udaipur", slug: "udaipur", url: "/destination/india/rajasthan/udaipur-tour-packages", count: "9 Tours" },
          { name: "Jaisalmer", slug: "jaisalmer", url: "/destination/india/rajasthan/jaisalmer-tour-packages", count: "7 Tours" },
          { name: "Jodhpur", slug: "jodhpur", url: "/destination/india/rajasthan/jodhpur-tour-packages", count: "6 Tours" },
          { name: "Pushkar", slug: "pushkar", url: "/destination/india/rajasthan/pushkar-tour-packages", count: "4 Tours" },
        ],
      },
      {
        name: "Goa Coastal",
        stateSlug: "goa",
        url: "/destination/india/goa-tour-packages",
        count: "20 Tours",
        isHot: true,
        places: [
          { name: "North Goa", slug: "north-goa", url: "/destination/india/goa/north-goa-tour-packages", count: "10 Tours" },
          { name: "South Goa", slug: "south-goa", url: "/destination/india/goa/south-goa-tour-packages", count: "8 Tours" },
          { name: "Calangute & Baga", slug: "calangute", url: "/destination/india/goa/calangute-tour-packages", count: "6 Tours" },
        ],
      },
      {
        name: "Maharashtra & MP",
        stateSlug: "maharashtra",
        url: "/destination/india/maharashtra-tour-packages",
        count: "12 Tours",
        places: [
          { name: "Lonavala", slug: "lonavala", url: "/destination/india/maharashtra/lonavala-tour-packages", count: "5 Tours" },
          { name: "Mahabaleshwar", slug: "mahabaleshwar", url: "/destination/india/maharashtra/mahabaleshwar-tour-packages", count: "5 Tours" },
          { name: "Gujarat & Kutch", slug: "gujarat", url: "/destination/india/gujarat-tour-packages", count: "13 Tours" },
        ],
      },
    ],
    "East and North East": [
      {
        name: "Sikkim & Bengal",
        stateSlug: "sikkim",
        url: "/destination/india/sikkim-tour-packages",
        count: "15 Tours",
        isHot: true,
        places: [
          { name: "Gangtok", slug: "gangtok", url: "/destination/india/sikkim/gangtok-tour-packages", count: "10 Tours" },
          { name: "Darjeeling", slug: "darjeeling", url: "/destination/india/west-bengal/darjeeling-tour-packages", count: "8 Tours" },
          { name: "Pelling", slug: "pelling", url: "/destination/india/sikkim/pelling-tour-packages", count: "4 Tours" },
        ],
      },
      {
        name: "Meghalaya & Assam",
        stateSlug: "meghalaya",
        url: "/destination/india/meghalaya-tour-packages",
        count: "12 Tours",
        places: [
          { name: "Shillong", slug: "shillong", url: "/destination/india/meghalaya/shillong-tour-packages", count: "8 Tours" },
          { name: "Cherrapunji", slug: "cherrapunji", url: "/destination/india/meghalaya/cherrapunji-tour-packages", count: "6 Tours" },
          { name: "Kaziranga", slug: "kaziranga", url: "/destination/india/assam/kaziranga-tour-packages", count: "6 Tours" },
        ],
      },
      {
        name: "Arunachal & Odisha",
        stateSlug: "arunachal",
        url: "/destination/india/arunachal-tour-packages",
        count: "7 Tours",
        places: [
          { name: "Tawang", slug: "tawang", url: "/destination/india/arunachal/tawang-tour-packages", count: "5 Tours" },
          { name: "Puri", slug: "puri", url: "/destination/india/odisha/puri-tour-packages", count: "6 Tours" },
        ],
      },
    ],
  };

  const islandsAndUTs = [
    { name: "Andaman Islands", slug: "andaman", url: "/destination/india/andaman-tour-packages", count: "14 Tours", icon: "🏝️" },
    { name: "Havelock Island", slug: "havelock", url: "/destination/india/andaman/havelock-tour-packages", count: "7 Tours", icon: "🤿" },
    { name: "Ladakh", slug: "ladakh", url: "/destination/india/ladakh-tour-packages", count: "16 Tours", icon: "🏔️" },
    { name: "Lakshadweep", slug: "lakshadweep", url: "/destination/india/lakshadweep-tour-packages", count: "6 Tours", icon: "🌊" },
    { name: "Puducherry", slug: "puducherry", url: "/destination/india/puducherry-tour-packages", count: "8 Tours", icon: "🏛️" },
    { name: "Jammu & Kashmir", slug: "kashmir", url: "/destination/india/kashmir-tour-packages", count: "18 Tours", icon: "❄️" },
  ];

  const worldDestinations = {
    "Europe & UK": [
      { name: "Switzerland Alps", slug: "switzerland", count: "12 Tours" },
      { name: "France & Paris", slug: "france", count: "9 Tours" },
      { name: "Italy & Vatican", slug: "italy", count: "11 Tours" },
      { name: "United Kingdom", slug: "uk", count: "8 Tours" },
      { name: "Central Europe", slug: "central-europe", count: "14 Tours" },
    ],
    "Asia & Middle East": [
      { name: "Dubai & Abu Dhabi", slug: "dubai", count: "15 Tours" },
      { name: "Bali & Indonesia", slug: "bali", count: "19 Tours" },
      { name: "Thailand (Phuket, Krabi)", slug: "thailand", count: "22 Tours" },
      { name: "Singapore & Malaysia", slug: "singapore", count: "16 Tours" },
      { name: "Vietnam & Cambodia", slug: "vietnam", count: "12 Tours" },
      { name: "Maldives Luxury", slug: "maldives", count: "10 Tours" },
    ],
    "Americas & Oceania": [
      { name: "USA East & West Coast", slug: "usa", count: "8 Tours" },
      { name: "Australia & NZ", slug: "australia", count: "10 Tours" },
      { name: "South Africa Wildlife", slug: "south-africa", count: "7 Tours" },
      { name: "Mauritius Island", slug: "mauritius", count: "6 Tours" },
    ],
  };

  const specialityTours = [
    { title: "Honeymoon & Romantic", tagline: "Private pool villas, candlelight dinners, scenic escapes", icon: "💍", theme: "HONEYMOON", href: "/packages?theme=HONEYMOON" },
    { title: "Women's Special Tours", tagline: "Safe, empowered all-women travel groups with female managers", icon: "💃", theme: "HONEYMOON", href: "/packages?theme=HONEYMOON" },
    { title: "Senior Citizens Holidays", tagline: "Comfortable pacing, wheelchair assistance, relaxed stays", icon: "🧘‍♂️", theme: "FAMILY", href: "/packages?theme=FAMILY" },
    { title: "Family Vacations", tagline: "Kid-friendly resorts, theme parks, private cabs", icon: "👨‍👩‍👧‍👦", theme: "FAMILY", href: "/packages?theme=FAMILY" },
    { title: "Adventure & Treks", tagline: "Spiti, Ladakh 4x4, river rafting, paragliding", icon: "🏔️", theme: "ADVENTURE", href: "/packages?theme=ADVENTURE" },
    { title: "Spiritual & Pilgrimage", tagline: "Chardham, Kashi, Tirupati, Rameshwaram, Vaishno Devi", icon: "🛕", theme: "PILGRIMAGE", href: "/packages?theme=PILGRIMAGE" },
  ];

  const customizedHolidays = [
    { title: "100% Tailor-Made Itineraries", desc: "Customize dates, hotel stars, private vehicles.", icon: "✨", href: "/customize" },
    { title: "Private Chauffeured Tours", desc: "Dedicated sanitized vehicle, English-speaking driver.", icon: "🚗", href: "/packages?travelType=PRIVATE" },
    { title: "Luxury Villas & Heritage", desc: "Private pool properties and royal palace suites.", icon: "🏰", href: "/packages?theme=LUXURY" },
    { title: "Weekend Short Getaways", desc: "2–4 days refreshing getaways from Delhi, Mumbai, Bengaluru.", icon: "🏖️", href: "/packages?nightsMax=4" },
  ];

  const megaMenuClass =
    "absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-2xl z-50 py-3.5 px-4 sm:px-6";

  return (
    <header
      ref={menuRef}
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/98 backdrop-blur-md shadow-xs"
          : activeMenu !== null || mobileMenuOpen
          ? "bg-slate-950/95 backdrop-blur-md shadow-xl"
          : "bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-transparent"
      }`}
    >
      {/* ── BAR 1: Top info strip (Compact) ── */}
      <div
        className={`transition-colors duration-200 border-b ${
          isSolid
            ? "bg-[#0b1b36] border-slate-800 text-white"
            : "bg-slate-950/30 backdrop-blur-xs border-white/10 text-white/90"
        }`}
      >
        <div className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-7 text-[10.5px] sm:text-[11px]">
            {/* Left: info */}
            <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none whitespace-nowrap">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-1.5 text-amber-400 font-bold hover:text-amber-300 transition-colors shrink-0"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                24/7: {helplinePhone}
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="text-slate-300 hover:text-white transition-colors hidden sm:block shrink-0"
              >
                ✉ {supportEmail}
              </a>
              <span className="text-emerald-400 font-semibold hidden md:flex items-center gap-1 shrink-0">
                <span>✓</span> 100% Customized · Zero Hidden Charges
              </span>
            </div>
            {/* Right: currency */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-300 hidden sm:block">🇮🇳 INR (₹)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BAR 2: Main Nav with Logo + Mega Menu (Compact Height, Clean Logo) ── */}
      <div
        className={`transition-all duration-200 ${
          isSolid
            ? "bg-white/98 border-b border-slate-200/90 shadow-2xs"
            : activeMenu !== null || mobileMenuOpen
            ? "bg-slate-900/95 border-b border-slate-700/80"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-[52px] sm:h-[56px] gap-4">
            {/* Logo (Clean, no black overlay line) */}
            <Link href="/" className="shrink-0 group flex items-center" aria-label="Be My Traveller — Home">
              <div
                className={`relative w-[150px] h-[34px] sm:w-[170px] sm:h-[38px] flex items-center transition-all ${
                  !isSolid ? "bg-white px-2 py-0.5 rounded-lg" : ""
                }`}
              >
                <Image
                  src="/Logo for website PNG.webp"
                  alt="Be My Traveller"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="180px"
                />
              </div>
            </Link>

            {/* Desktop Mega Menu Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 h-full flex-1 justify-center">
              {/* India */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu("india")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href="/destination/india-tour-packages"
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer h-full ${
                    activeMenu === "india"
                      ? "text-amber-500 bg-amber-500/15"
                      : isSolid
                      ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                      : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                  }`}
                >
                  India
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMenu === "india"
                        ? "rotate-180 text-amber-500"
                        : isSolid
                        ? "text-slate-400"
                        : "text-white/80"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>

              {/* World */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu("world")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer h-full ${
                    activeMenu === "world"
                      ? "text-amber-500 bg-amber-500/15"
                      : isSolid
                      ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                      : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                  }`}
                >
                  World
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMenu === "world"
                        ? "rotate-180 text-amber-500"
                        : isSolid
                        ? "text-slate-400"
                        : "text-white/80"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Speciality Tours */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu("speciality")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer h-full ${
                    activeMenu === "speciality"
                      ? "text-amber-500 bg-amber-500/15"
                      : isSolid
                      ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                      : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                  }`}
                >
                  Speciality Tours
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMenu === "speciality"
                        ? "rotate-180 text-amber-500"
                        : isSolid
                        ? "text-slate-400"
                        : "text-white/80"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Customized Holidays */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu("customized")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer h-full ${
                    activeMenu === "customized"
                      ? "text-amber-500 bg-amber-500/15"
                      : isSolid
                      ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                      : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                  }`}
                >
                  Customized Holidays
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMenu === "customized"
                        ? "rotate-180 text-amber-500"
                        : isSolid
                        ? "text-slate-400"
                        : "text-white/80"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Corporate Travel */}
              <Link
                href="/customize?type=CORPORATE"
                className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                  isSolid
                    ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                    : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                }`}
              >
                Corporate Travel
              </Link>

              {/* Contact Us */}
              <Link
                href="/contact"
                className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                  isSolid
                    ? "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                    : "text-white hover:text-amber-300 hover:bg-white/10 drop-shadow-xs"
                }`}
              >
                Contact Us
              </Link>
            </nav>

            {/* Desktop Right: Phone + CTA */}
            <div className="hidden lg:flex items-center gap-2.5 shrink-0">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {helplinePhone}
              </a>
              <Link
                href="/customize"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-2xs transition-all cursor-pointer"
              >
                Free Quote →
              </Link>
            </div>

            {/* Mobile Hamburger (High-Contrast & Always Visible) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/60 shadow-xs active:scale-95 shrink-0"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center">
                <span
                  className={`w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mega Menu Dropdowns (Desktop) ── */}

      {/* 1. India Hierarchical Mega Menu (Compact & Professional) */}
      {activeMenu === "india" && (
        <div
          onMouseEnter={() => setActiveMenu("india")}
          onMouseLeave={() => setActiveMenu(null)}
          className={megaMenuClass}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header: Compact single-row bar */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-[13.5px] font-black text-slate-900 tracking-tight">Explore India Holiday Packages</h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
                  28 States · 8 UTs
                </span>
              </div>
              <Link
                href="/destination/india-tour-packages"
                onClick={() => setActiveMenu(null)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 shrink-0"
              >
                View All India Packages →
              </Link>
            </div>

            {/* 4 Region Columns: Compact state cards with multiple places */}
            <div className="grid grid-cols-4 gap-3.5">
              {Object.entries(indiaRegions).map(([region, states]) => (
                <div key={region} className="space-y-2">
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-700 pb-0.5 border-b border-slate-200/80">
                    {region}
                  </h4>

                  <div className="space-y-1.5">
                    {states.map((state) => (
                      <div
                        key={state.stateSlug}
                        className="p-1.5 px-2 rounded-lg bg-slate-50/70 hover:bg-amber-50/40 border border-slate-100 hover:border-amber-300/60 transition-all group/state space-y-1"
                      >
                        {/* Parent State Header Link */}
                        <Link
                          href={state.url}
                          onClick={() => setActiveMenu(null)}
                          className="flex items-center justify-between font-bold text-[12px] text-slate-900 hover:text-amber-700 transition-colors leading-tight"
                        >
                          <span className="flex items-center gap-1">
                            {state.isHot && <span className="text-[9px]" title="Trending State">🔥</span>}
                            <span className="group-hover/state:underline">{state.name}</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100/90 text-amber-800 shrink-0">
                            {state.count}
                          </span>
                        </Link>

                        {/* Child Places Nested Under State (Compact Tags) */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {state.places.map((place) => (
                            <Link
                              key={place.slug}
                              href={place.url}
                              onClick={() => setActiveMenu(null)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-600 text-[10px] font-medium border border-slate-200/70 hover:border-amber-500 shadow-3xs transition-all group/place leading-tight"
                              title={`${place.name} Packages (${place.count})`}
                            >
                              <span>{place.name}</span>
                              <span className="text-[8.5px] text-slate-400 group-hover/place:text-slate-900">
                                ({place.count.replace(" Tours", "")})
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bottom Bar: Islands and Union Territory (Compact) ── */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 bg-gradient-to-r from-amber-50/40 via-slate-50 to-amber-50/40 -mx-4 sm:-mx-6 -mb-3.5 px-4 sm:px-6 py-2 rounded-b-xl">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🏝️</span>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900">
                    Islands &amp; Union Territory
                  </h4>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full hidden sm:inline">
                    Exotic Escapes
                  </span>
                </div>
                <Link
                  href="/destinations"
                  onClick={() => setActiveMenu(null)}
                  className="text-[10.5px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
                >
                  Explore All UT Packages →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {islandsAndUTs.map((ut) => (
                  <Link
                    key={ut.name}
                    href={ut.url}
                    onClick={() => setActiveMenu(null)}
                    className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white hover:bg-amber-500 border border-slate-200/80 hover:border-amber-500 transition-all shadow-3xs group"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] shrink-0">{ut.icon}</span>
                      <span className="text-[10.5px] font-bold text-slate-800 group-hover:text-slate-950 truncate">
                        {ut.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-slate-950 ml-1 shrink-0">
                      {ut.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. World */}
      {activeMenu === "world" && (
        <div
          onMouseEnter={() => setActiveMenu("world")}
          onMouseLeave={() => setActiveMenu(null)}
          className={megaMenuClass}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[13.5px] font-black text-slate-900">International Holidays &amp; World Wonders</h3>
              </div>
              <Link
                href="/packages?type=INTERNATIONAL"
                onClick={() => setActiveMenu(null)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 shrink-0"
              >
                View All World Tours →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(worldDestinations).map(([region, places]) => (
                <div key={region} className="space-y-1.5">
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-600 pb-1 border-b border-slate-100">
                    {region}
                  </h4>
                  <ul className="space-y-1">
                    {places.map((place) => (
                      <li key={place.slug}>
                        <Link
                          href={`/packages?destination=${place.slug}`}
                          onClick={() => setActiveMenu(null)}
                          className="flex items-center justify-between py-0.5 text-slate-700 hover:text-amber-600 hover:translate-x-0.5 transition-all group text-[11.5px] font-medium"
                        >
                          <span className="group-hover:font-semibold">{place.name}</span>
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full ml-1.5 group-hover:bg-amber-50 group-hover:text-amber-700 shrink-0">
                            {place.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Speciality Tours */}
      {activeMenu === "speciality" && (
        <div
          onMouseEnter={() => setActiveMenu("speciality")}
          onMouseLeave={() => setActiveMenu(null)}
          className={megaMenuClass}
        >
          <div className="max-w-7xl mx-auto">
            <div className="pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-[13.5px] font-black text-slate-900">Signature Speciality Tours</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {specialityTours.map((theme) => (
                <Link
                  key={theme.title}
                  href={theme.href}
                  onClick={() => setActiveMenu(null)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-amber-400/40 bg-slate-50/60 hover:bg-amber-50/40 transition-all group flex items-start gap-2.5"
                >
                  <span className="text-xl p-1.5 rounded-lg bg-white shadow-2xs shrink-0">{theme.icon}</span>
                  <div>
                    <h4 className="font-bold text-[12px] text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {theme.title}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">{theme.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Customized Holidays */}
      {activeMenu === "customized" && (
        <div
          onMouseEnter={() => setActiveMenu("customized")}
          onMouseLeave={() => setActiveMenu(null)}
          className={megaMenuClass}
        >
          <div className="max-w-7xl mx-auto">
            <div className="pb-2 mb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-[13.5px] font-black text-slate-900">Customized Holidays &amp; Tailor-Made Trips</h3>
              </div>
              <Link
                href="/customize"
                onClick={() => setActiveMenu(null)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-2xs transition-all shrink-0"
              >
                Open Trip Builder →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {customizedHolidays.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => setActiveMenu(null)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-amber-400/40 hover:shadow-sm transition-all group flex flex-col"
                >
                  <span className="text-xl mb-1.5">{item.icon}</span>
                  <h4 className="font-bold text-[12px] text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1 flex-1">{item.desc}</p>
                  <span className="text-[11px] font-bold text-amber-600 mt-2">Explore →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Full-Screen Drawer (Rendered via Portal on document.body to bypass header stacking context) ── */}
      {mobileMenuOpen && mounted && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-white shrink-0 shadow-xs">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
              <div className="relative w-36 h-10">
                <Image
                  src="/Logo for website PNG.webp"
                  alt="Be My Traveller"
                  fill
                  className="object-contain object-left"
                  sizes="144px"
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center text-sm border border-amber-200 transition-colors"
                aria-label="Call Helpline"
                title="Call 24/7 Helpline"
              >
                📞
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Primary Actions Bar */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-50 border-b border-amber-200/60 flex items-center gap-2 shrink-0">
            <Link
              href="/customize"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-sm shadow-amber-500/25 flex items-center justify-center gap-1.5"
            >
              <span>✨</span>
              <span>Plan Custom Trip</span>
            </Link>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hi! I would like to plan a trip with Be My Traveller.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0 transition-colors"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Scrollable Nav Content Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 pb-6">
            {/* 1. India Holidays Accordion */}
            <div>
              <button
                onClick={() => setMobileExpandedSection(mobileExpandedSection === "india" ? null : "india")}
                className="w-full flex items-center justify-between px-4 py-3.5 font-bold text-slate-900 bg-slate-50/60 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[14px]">
                  <span className="text-base">🇮🇳</span>
                  <span>India Holidays (States &amp; Places)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    28 States
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileExpandedSection === "india" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {mobileExpandedSection === "india" && (
                <div className="bg-slate-50/90 px-3.5 py-2.5 space-y-3">
                  <Link
                    href="/destination/india-tour-packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs"
                  >
                    View All India Tour Packages (250+) →
                  </Link>

                  {Object.entries(indiaRegions).map(([region, states]) => (
                    <div key={region} className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 px-1 pt-1">
                        {region}
                      </p>

                      <div className="space-y-1.5">
                        {states.map((st) => (
                          <div
                            key={st.stateSlug}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <Link
                                href={st.url}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-bold text-[13px] text-slate-900 hover:text-amber-600 flex items-center gap-1.5"
                              >
                                {st.isHot && <span className="text-[10px]">🔥</span>}
                                <span>{st.name}</span>
                              </Link>
                              <Link
                                href={st.url}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                              >
                                {st.count}
                              </Link>
                            </div>

                            {/* Nested Places under State */}
                            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-100">
                              {st.places.map((pl) => (
                                <Link
                                  key={pl.slug}
                                  href={pl.url}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-[10.5px] font-medium bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 px-2 py-0.5 rounded transition-colors"
                                >
                                  {pl.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Islands & UTs */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 py-1 px-1">
                      🏝️ Islands &amp; Union Territories
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                      {islandsAndUTs.map((ut) => (
                        <Link
                          key={ut.name}
                          href={ut.url}
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-800 hover:text-amber-600 flex items-center gap-1.5 truncate shadow-2xs"
                        >
                          <span>{ut.icon}</span>
                          <span className="truncate">{ut.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. World Tours Accordion */}
            <div>
              <button
                onClick={() => setMobileExpandedSection(mobileExpandedSection === "world" ? null : "world")}
                className="w-full flex items-center justify-between px-4 py-3.5 font-bold text-slate-800 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[14px]">
                  <span className="text-base">🌍</span>
                  <span>World &amp; International Tours</span>
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    mobileExpandedSection === "world" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpandedSection === "world" && (
                <div className="bg-slate-50/90 px-4 py-3 space-y-3">
                  {Object.entries(worldDestinations).map(([region, places]) => (
                    <div key={region} className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                        {region}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {places.map((p) => (
                          <Link
                            key={p.slug + p.name}
                            href={`/packages?destination=${p.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-[11.5px] font-semibold text-slate-800 p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 truncate shadow-2xs"
                          >
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Speciality Tours Accordion */}
            <div>
              <button
                onClick={() =>
                  setMobileExpandedSection(mobileExpandedSection === "speciality" ? null : "speciality")
                }
                className="w-full flex items-center justify-between px-4 py-3.5 font-bold text-slate-800 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[14px]">
                  <span className="text-base">💎</span>
                  <span>Signature &amp; Speciality Tours</span>
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    mobileExpandedSection === "speciality" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpandedSection === "speciality" && (
                <div className="bg-slate-50/90 px-4 py-3 space-y-1.5">
                  {specialityTours.map((t) => (
                    <Link
                      key={t.title}
                      href={t.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:text-amber-600 shadow-2xs"
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Quick Links */}
            <div className="py-2">
              {[
                { href: "/packages", label: "All Holiday Packages", icon: "🏖️" },
                { href: "/destinations", label: "Destinations Directory", icon: "🗺️" },
                { href: "/customize?type=CORPORATE", label: "Corporate & MICE Travel", icon: "🏢" },
                { href: "/contact", label: "Contact & Branch Offices", icon: "📍" },
                { href: "/about", label: "About Be My Traveller", icon: "ℹ️" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 font-semibold text-slate-800 hover:text-amber-600 hover:bg-slate-50 transition-colors text-[13px]"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Sticky Action Dock (Fixed at bottom for thumb reach) */}
          <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>📞</span>
              <span>{helplinePhone}</span>
            </a>
            <Link
              href="/packages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              View Packages (100+) →
            </Link>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
