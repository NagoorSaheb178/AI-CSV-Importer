"use client";

import { useState } from "react";
import { CRMRecord, ImportResult } from "@/types";

interface ResultsStepProps {
  result: ImportResult;
  onReset: () => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "GOOD_LEAD_FOLLOW_UP":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Good Lead</span>;
    case "BAD_LEAD":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Bad Lead</span>;
    case "SALE_DONE":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Sale Done</span>;
    case "DID_NOT_CONNECT":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>No Connect</span>;
    default:
      return status ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">{status}</span>
      ) : (
        <span className="text-stone-300 text-xs">—</span>
      );
  }
}

function downloadCSV(records: CRMRecord[], filename: string) {
  const headers = [
    "created_at",
    "name",
    "email",
    "country_code",
    "mobile_without_country_code",
    "company",
    "city",
    "state",
    "country",
    "lead_owner",
    "crm_status",
    "crm_note",
    "data_source",
    "possession_time",
    "description",
  ];

  const escape = (v: string) => {
    const s = String(v ?? "").replace(/\n/g, "\\n");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = [
    headers.join(","),
    ...records.map((r) => headers.map((h) => escape(r[h as keyof CRMRecord])).join(",")),
  ];

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CRM_HEADERS: { key: keyof CRMRecord; label: string; minWidth: number }[] = [
  { key: "name", label: "Name", minWidth: 140 },
  { key: "email", label: "Email", minWidth: 180 },
  { key: "country_code", label: "CC", minWidth: 60 },
  { key: "mobile_without_country_code", label: "Mobile", minWidth: 120 },
  { key: "company", label: "Company", minWidth: 120 },
  { key: "city", label: "City", minWidth: 100 },
  { key: "state", label: "State", minWidth: 100 },
  { key: "country", label: "Country", minWidth: 100 },
  { key: "crm_status", label: "Status", minWidth: 140 },
  { key: "data_source", label: "Source", minWidth: 120 },
  { key: "lead_owner", label: "Owner", minWidth: 140 },
  { key: "created_at", label: "Created At", minWidth: 160 },
  { key: "crm_note", label: "Note", minWidth: 200 },
  { key: "possession_time", label: "Possession", minWidth: 110 },
  { key: "description", label: "Description", minWidth: 200 },
];

export default function ResultsStep({ result, onReset }: ResultsStepProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">("imported");
  const { imported, skipped, total_imported, total_skipped } = result;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-1">Import Complete</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            AI has successfully processed and extracted your CRM records.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-stone-900 dark:text-white mb-1">{total_imported + total_skipped}</div>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Total Rows</div>
        </div>
        <div className="bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{total_imported}</div>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Imported</div>
        </div>
        <div className="bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-red-500 dark:text-red-400 mb-1">{total_skipped}</div>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Skipped</div>
        </div>
        <div className="bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-stone-900 dark:text-white mb-1">
            {total_imported + total_skipped > 0
              ? Math.round((total_imported / (total_imported + total_skipped)) * 100)
              : 0}%
          </div>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Success Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex bg-stone-100 dark:bg-stone-900/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("imported")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "imported" ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
          >
            Imported ({total_imported})
          </button>
          <button
            onClick={() => setActiveTab("skipped")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "skipped" ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
          >
            Skipped ({total_skipped})
          </button>
        </div>

        {activeTab === "imported" && imported.length > 0 && (
          <button
            onClick={() => downloadCSV(imported, "groweasy_crm_import.csv")}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        )}
      </div>

      {/* Imported Table */}
      {activeTab === "imported" && (
        <>
          {imported.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900/30">
              <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-stone-100 dark:border-stone-700 text-stone-400 dark:text-stone-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-stone-500 dark:text-stone-400 font-medium">No records were imported.</div>
            </div>
          ) : (
            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900/50 shadow-sm mb-8">
              <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
                <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700 min-w-[40px]">#</th>
                      {CRM_HEADERS.map((h) => (
                        <th key={h.key} className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700" style={{ minWidth: `${h.minWidth}px` }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 bg-white dark:bg-transparent">
                    {imported.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="px-4 py-3 text-stone-400 dark:text-stone-500 text-xs whitespace-nowrap">
                          {idx + 1}
                        </td>
                        {CRM_HEADERS.map((h) => (
                          <td key={h.key} className="px-4 py-3 text-stone-700 dark:text-stone-300 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis" title={String(row[h.key] ?? "")}>
                            {h.key === "crm_status" ? (
                              getStatusBadge(row.crm_status)
                            ) : row[h.key] ? (
                              row[h.key]
                            ) : (
                              <span className="text-stone-300 dark:text-stone-600 italic text-xs">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Skipped Table */}
      {activeTab === "skipped" && (
        <>
          {skipped.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900/30">
              <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-stone-100 dark:border-stone-700 text-stone-400 dark:text-stone-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-stone-500 dark:text-stone-400 font-medium">No records were skipped — perfect import!</div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 mb-6 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  These records were skipped because they had neither an email nor a mobile number.
                </span>
              </div>
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900/50 shadow-sm mb-8">
                <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
                  <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
                    <thead className="bg-stone-50 dark:bg-stone-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700">#</th>
                        {skipped[0] &&
                          Object.keys(skipped[0]).map((k) => (
                            <th key={k} className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700 min-w-[140px]">
                              {k}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 bg-white dark:bg-transparent">
                      {skipped.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                          <td className="px-4 py-3 text-stone-400 dark:text-stone-500 text-xs whitespace-nowrap">
                            {idx + 1}
                          </td>
                          {Object.values(row).map((v, vi) => (
                            <td key={vi} className="px-4 py-3 text-stone-700 dark:text-stone-300 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis" title={String(v ?? "")}>
                              {String(v) || (
                                <span className="text-stone-300 dark:text-stone-600 italic">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="flex items-center justify-start pt-6 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Import Another CSV
        </button>
      </div>
    </div>
  );
}
