"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BmtNavMenu from "@/components/navigation/BmtNavMenu";

export default function DestinationsDirectoryPage() {
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [livePlaces, setLivePlaces] = useState<any[]>([]);

  const defaultPlaces = [
    {
      slug: "himachal",
      url: "/destination/india/himachal-tour-packages",
      name: "Himachal Pradesh",
      region: "NORTH",
      type: "STATE",
      tagline: "Valley of Gods, Snow Peaks & Adventure Circuits",
      packagesCount: 24,
      startingPrice: "₹14,999",
      img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Manali", url: "/destination/india/himachal/manali-tour-packages" },
        { name: "Shimla", url: "/destination/india/himachal/shimla-tour-packages" },
        { name: "Dharamshala", url: "/destination/india/himachal/dharamshala-tour-packages" },
        { name: "Spiti Valley", url: "/destination/india/himachal/spiti-tour-packages" },
      ],
    },
    {
      slug: "kashmir",
      url: "/destination/india/kashmir-tour-packages",
      name: "Kashmir Paradise",
      region: "NORTH",
      type: "STATE",
      tagline: "Paradise on Earth with Shimmering Lakes & Snowfields",
      packagesCount: 18,
      startingPrice: "₹24,500",
      img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Gulmarg", url: "/destination/india/kashmir/gulmarg-tour-packages" },
        { name: "Srinagar", url: "/destination/india/kashmir/srinagar-tour-packages" },
        { name: "Pahalgam", url: "/destination/india/kashmir/pahalgam-tour-packages" },
        { name: "Sonamarg", url: "/destination/india/kashmir/sonamarg-tour-packages" },
      ],
    },
    {
      slug: "kerala",
      url: "/destination/india/kerala-tour-packages",
      name: "Kerala Backwaters",
      region: "SOUTH",
      type: "STATE",
      tagline: "God's Own Country with Serene Backwaters & Spice Hills",
      packagesCount: 21,
      startingPrice: "₹21,999",
      img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Munnar", url: "/destination/india/kerala/munnar-tour-packages" },
        { name: "Alleppey", url: "/destination/india/kerala/alleppey-tour-packages" },
        { name: "Thekkady", url: "/destination/india/kerala/thekkady-tour-packages" },
        { name: "Wayanad", url: "/destination/india/kerala/wayanad-tour-packages" },
      ],
    },
    {
      slug: "rajasthan",
      url: "/destination/india/rajasthan-tour-packages",
      name: "Royal Rajasthan",
      region: "WEST",
      type: "STATE",
      tagline: "The Royal Realm of Hilltop Forts, Palaces & Desert Havelis",
      packagesCount: 16,
      startingPrice: "₹19,500",
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Jaipur", url: "/destination/india/rajasthan/jaipur-tour-packages" },
        { name: "Udaipur", url: "/destination/india/rajasthan/udaipur-tour-packages" },
        { name: "Jaisalmer", url: "/destination/india/rajasthan/jaisalmer-tour-packages" },
        { name: "Jodhpur", url: "/destination/india/rajasthan/jodhpur-tour-packages" },
      ],
    },
    {
      slug: "andaman",
      url: "/destination/india/andaman-tour-packages",
      name: "Andaman & Nicobar Islands",
      region: "ISLANDS",
      type: "ISLAND",
      tagline: "Crystal Turquoise Waters, Coral Reefs & White Sand Beaches",
      packagesCount: 14,
      startingPrice: "₹28,999",
      img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Havelock Island", url: "/destination/india/andaman/havelock-tour-packages" },
        { name: "Neil Island", url: "/destination/india/andaman/neil-tour-packages" },
        { name: "Port Blair", url: "/destination/india/andaman/port-blair-tour-packages" },
      ],
    },
    {
      slug: "goa",
      url: "/destination/india/goa-tour-packages",
      name: "Goa Coastal",
      region: "WEST",
      type: "STATE",
      tagline: "Sun-Kissed Beaches, Portuguese Heritage & Vibrant Nightlife",
      packagesCount: 20,
      startingPrice: "₹12,999",
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "North Goa", url: "/destination/india/goa/north-goa-tour-packages" },
        { name: "South Goa", url: "/destination/india/goa/south-goa-tour-packages" },
        { name: "Calangute", url: "/destination/india/goa/calangute-tour-packages" },
      ],
    },
    {
      slug: "ladakh",
      url: "/destination/india/ladakh-tour-packages",
      name: "Ladakh Heights",
      region: "NORTH",
      type: "STATE",
      tagline: "Land of High Passes, Blue Pangong Lake & Ancient Monasteries",
      packagesCount: 16,
      startingPrice: "₹32,500",
      img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Leh", url: "/destination/india/ladakh/leh-tour-packages" },
        { name: "Nubra Valley", url: "/destination/india/ladakh/nubra-tour-packages" },
        { name: "Pangong Lake", url: "/destination/india/ladakh/pangong-tour-packages" },
      ],
    },
    {
      slug: "bali",
      url: "/destination/world/bali-tour-packages",
      name: "Bali & Indonesia",
      region: "INTERNATIONAL",
      type: "ISLAND",
      tagline: "Tropical Paradise of Terraced Rice Fields & Private Pool Villas",
      packagesCount: 19,
      startingPrice: "₹38,500",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Ubud", url: "/packages?destination=bali" },
        { name: "Seminyak", url: "/packages?destination=bali" },
        { name: "Nusa Penida", url: "/packages?destination=bali" },
      ],
    },
    {
      slug: "dubai",
      url: "/destination/world/dubai-tour-packages",
      name: "Dubai & Emirates",
      region: "INTERNATIONAL",
      type: "COUNTRY",
      tagline: "Futuristic Skyscrapers, Luxury Shopping & Desert Dunes",
      packagesCount: 15,
      startingPrice: "₹48,999",
      img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
      topPlaces: [
        { name: "Burj Khalifa", url: "/packages?destination=dubai" },
        { name: "Palm Jumeirah", url: "/packages?destination=dubai" },
        { name: "Desert Safari", url: "/packages?destination=dubai" },
      ],
    },
  ];

  useEffect(() => {
    async function fetchLiveDestinations() {
      try {
        const res = await fetch("/api/v1/destinations/hierarchy");
        const data = await res.json();
        if (data.states && data.states.length > 0) {
          const merged = defaultPlaces.map((dp) => {
            const match = data.states.find(
              (s: any) =>
                s.slug === dp.slug ||
                s.slug === `${dp.slug}-pradesh` ||
                s.name.toLowerCase().includes(dp.slug)
            );
            if (match) {
              const liveImg = match.coverImageStr || match.coverImage;
              return {
                ...dp,
                name: match.name || dp.name,
                tagline: match.tagline || dp.tagline,
                startingPrice: match.startingPrice || dp.startingPrice,
                img: liveImg || dp.img,
                topPlaces:
                  match.cities && match.cities.length > 0
                    ? match.cities.map((c: any) => ({
                        name: c.name,
                        url: `/destination/india/${dp.slug}/${c.slug}-tour-packages`,
                      }))
                    : dp.topPlaces,
              };
            }
            return dp;
          });
          setLivePlaces(merged);
        }
      } catch (err) {
        console.error("Error fetching live destinations:", err);
      }
    }
    fetchLiveDestinations();
  }, []);

  const places = livePlaces.length > 0 ? livePlaces : defaultPlaces;

  const filteredPlaces =
    selectedRegion === "ALL"
      ? places
      : places.filter((p) => p.region === selectedRegion);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── BMT Top Navigation ── */}
      <BmtNavMenu />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white -mt-[96px] pt-[124px] pb-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Link href="/" className="hover:underline">Home</Link>
            <span>›</span>
            <Link href="/destination/india-tour-packages" className="hover:underline">India Tours</Link>
            <span>›</span>
            <span>Destinations Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Explore Places &amp; Tour Destinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Choose your dream state or place to browse day-wise tour packages, top sightseeing attractions, seasonal weather guides, and verified 4★/5★ hotel itineraries.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 bg-slate-50 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          {[
            { id: "ALL", label: "All Destinations" },
            { id: "NORTH", label: "North India" },
            { id: "SOUTH", label: "South India" },
            { id: "WEST", label: "West & Central" },
            { id: "ISLANDS", label: "Islands & UTs" },
            { id: "INTERNATIONAL", label: "International Escapes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRegion(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedRegion === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.slug}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={place.img}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-950/80 text-amber-400 backdrop-blur-md border border-white/10">
                    {place.type}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                    {place.packagesCount} Tour Packages
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <Link href={place.url}>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {place.name}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {place.tagline}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      Popular Places Under {place.name}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {place.topPlaces.map((tp: any) => (
                        <Link
                          key={tp.name}
                          href={tp.url}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          {tp.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting From</span>
                    <span className="text-lg font-black text-slate-900">{place.startingPrice}</span>
                  </div>

                  <Link
                    href={place.url}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Explore Tours →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
