"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  createButton?: {
    label: string;
    href: string;
  };
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function AdminDataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  onSearch,
  createButton,
  totalCount = data.length,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const filteredData = onSearch
    ? data
    : data.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {createButton && (
          <Link
            href={createButton.href}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            <span>+</span> {createButton.label}
          </Link>
        )}
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-5 py-3.5 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr
                    key={row._id || row.id || rowIdx}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-5 py-3.5 ${col.className || ""}`}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String((row as any)[col.accessorKey] ?? "—")
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-300">{filteredData.length}</strong> of{" "}
            <strong className="text-slate-300">{totalCount}</strong> entries
          </span>
          {onPageChange && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                Previous
              </button>
              <span className="text-slate-400 px-2 font-medium">Page {currentPage}</span>
              <button
                type="button"
                disabled={currentPage * pageSize >= totalCount}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
