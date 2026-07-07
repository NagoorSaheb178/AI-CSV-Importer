"use client";

import { RawRecord } from "@/types";

interface PreviewStepProps {
  data: RawRecord[];
  fileName: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PreviewStep({
  data,
  fileName,
  onConfirm,
  onBack,
}: PreviewStepProps) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const displayRows = data;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0 text-stone-600 dark:text-stone-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-1">CSV Preview</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Review your data before AI processing. No AI calls happen at this stage.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 mb-6 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 text-sm">
        <svg className="w-5 h-5 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>{data.length} rows</strong> detected in{" "}
          <strong>{fileName}</strong> with{" "}
          <strong>{headers.length} columns</strong>. The AI will intelligently map these to GrowEasy CRM fields.
        </span>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Showing <strong className="text-stone-900 dark:text-stone-200">{displayRows.length}</strong> of{" "}
          <strong className="text-stone-900 dark:text-stone-200">{data.length}</strong> rows
        </div>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          Scroll horizontally to see all columns
        </div>
      </div>

      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900/50 shadow-sm mb-8">
        <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
          <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700 min-w-[50px]">#</th>
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-xs whitespace-nowrap border-b border-stone-200 dark:border-stone-700 min-w-[140px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 bg-white dark:bg-transparent">
              {displayRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="px-4 py-3 text-stone-400 dark:text-stone-500 text-xs whitespace-nowrap">
                    {idx + 1}
                  </td>
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-3 text-stone-700 dark:text-stone-300 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis" title={row[h] || ""}>
                      {row[h] || (
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

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-100 dark:border-stone-800">
        <button 
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white dark:text-stone-900 bg-stone-800 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px] flex items-center gap-2"
          onClick={onConfirm}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Confirm & Import with AI
        </button>
      </div>
    </div>
  );
}
