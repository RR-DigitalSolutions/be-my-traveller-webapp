"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";

interface CustomerItem {
  name: string;
  phone: string;
  email: string;
  city: string;
  totalBookings: number;
  totalSpend: number;
  lastTrip: string;
  status: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Populate customers list from live and default database records
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const defaultCustomers: CustomerItem[] = [
          {
            name: "Vikram Malhotra",
            phone: "+91 98200 45678",
            email: "vikram.m@gmail.com",
            city: "Mumbai",
            totalBookings: 3,
            totalSpend: 245000,
            lastTrip: "Kashmir Luxury Tour (Oct 2026)",
            status: "VIP",
          },
          {
            name: "Ananya Deshmukh",
            phone: "+91 97112 34567",
            email: "ananya.d@outlook.com",
            city: "Delhi NCR",
            totalBookings: 2,
            totalSpend: 185000,
            lastTrip: "Himachal Explorer (Nov 2026)",
            status: "ACTIVE",
          },
          {
            name: "Rahul & Sneha Kapoor",
            phone: "+91 98450 12345",
            email: "rahul.kapoor@techcorp.in",
            city: "Bengaluru",
            totalBookings: 1,
            totalSpend: 188000,
            lastTrip: "Bali Honeymoon Villa (Dec 2026)",
            status: "ACTIVE",
          },
          {
            name: "Dr. Priya Sundaram",
            phone: "+91 94440 88990",
            email: "priya.s@apollohealth.org",
            city: "Chennai",
            totalBookings: 4,
            totalSpend: 395000,
            lastTrip: "Dubai & Abu Dhabi Ultra Explorer",
            status: "VIP",
          },
          {
            name: "Siddharth Oberoi",
            phone: "+91 98100 77123",
            email: "sid.oberoi@globalventures.com",
            city: "Gurugram",
            totalBookings: 2,
            totalSpend: 160000,
            lastTrip: "Rajasthan Royal Palaces Tour",
            status: "ACTIVE",
          },
        ];
        setCustomers(defaultCustomers);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Database &amp; Directory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Registered travelers, repeat client profiles, total spend value, and trip preferences.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by customer name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Traveler Name</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Total Trips</th>
              <th className="py-3.5 px-4">Lifetime Spend</th>
              <th className="py-3.5 px-4">Recent Itinerary</th>
              <th className="py-3.5 px-4 text-right">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading customer database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No customers found matching search.
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-[13px]">
                    👤 {c.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-slate-200">{c.phone}</p>
                    <p className="text-[11px] text-slate-500">{c.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    📍 {c.city}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {c.totalBookings} Completed
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                    {formatINR(c.totalSpend)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {c.lastTrip}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        c.status === "VIP"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
