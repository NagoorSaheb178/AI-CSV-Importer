"use client";

import { useEffect, useRef, useState } from "react";
import { CRMRecord, ImportResult, RawRecord } from "@/types";

declare global {
  interface Window {
    puter: any;
  }
}

interface ProcessingStepProps {
  data: RawRecord[];
  onComplete: (result: ImportResult) => void;
  onError: (err: string) => void;
}

interface BatchLog {
  batchNum: number;
  total: number;
  status: "waiting" | "processing" | "done" | "error" | "retrying";
  message: string;
}

const BATCH_SIZE = 10;
const MAX_RETRIES = 5;

const ALLOWED_STATUSES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

const ALLOWED_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];




async function processBatchWithRetry(
  records: RawRecord[],
  batchNum: number,
  retries = 0
): Promise<Partial<CRMRecord>[]> {
  try {
    const res = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: records }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Backend API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data.extracted || [];
  } catch (err: any) {
    if (retries < MAX_RETRIES) {
      const delay = 1000 * Math.pow(2, retries + 1); // 2s, 4s, 8s, 16s, 32s
      console.warn(`Batch ${batchNum} failed (${err.message}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return processBatchWithRetry(records, batchNum, retries + 1);
    }
    console.error(`Batch ${batchNum} failed after ${MAX_RETRIES} retries:`, err);
    return records.map(() => ({})); // Return empty objects if totally failed so local logic skips them
  }
}

export default function ProcessingStep({
  data,
  onComplete,
  onError,
}: ProcessingStepProps) {
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing batches...");
  const hasStarted = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const run = async () => {
      const batches: RawRecord[][] = [];
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        batches.push(data.slice(i, i + BATCH_SIZE));
      }

      const totalBatches = batches.length;
      const allImported: CRMRecord[] = [];
      const allSkipped: RawRecord[] = [];

      setLogs(
        batches.map((b, i) => ({
          batchNum: i + 1,
          total: b.length,
          status: "waiting",
          message: "Waiting...",
        }))
      );

      for (let i = 0; i < batches.length; i++) {
        setStatusText(`Processing batch ${i + 1} of ${totalBatches}...`);

        setLogs((prev) =>
          prev.map((l) =>
            l.batchNum === i + 1
              ? { ...l, status: "processing", message: "Extracting data with AI..." }
              : l
          )
        );

        const extractedArr = await processBatchWithRetry(batches[i], i + 1);
        
        let batchImported = 0;
        let batchSkipped = 0;

        for (let j = 0; j < batches[i].length; j++) {
            const rawRec = batches[i][j];
            // If AI returned fewer items than expected, use empty object to force skip
            const crmRec = extractedArr[j] || {}; 
            
            const email = String(crmRec.email || "").trim();
            const mobile = String(crmRec.mobile_without_country_code || "").replace(/[^0-9]/g, "");

            // STRICT LOCAL SKIPPING LOGIC:
            if (!email && !mobile) {
                allSkipped.push(rawRec);
                batchSkipped++;
                continue;
            }

            // Clean & finalize record
            const finalRecord: CRMRecord = {
                created_at: crmRec.created_at || new Date().toISOString(),
                name: crmRec.name || "",
                email: email,
                country_code: crmRec.country_code || "+91",
                mobile_without_country_code: mobile,
                company: crmRec.company || "",
                city: crmRec.city || "",
                state: crmRec.state || "",
                country: crmRec.country || "",
                lead_owner: crmRec.lead_owner || "",
                crm_status: ALLOWED_STATUSES.includes(crmRec.crm_status as string) ? crmRec.crm_status as any : "",
                crm_note: crmRec.crm_note || "",
                data_source: ALLOWED_SOURCES.includes(crmRec.data_source as string) ? crmRec.data_source as any : "",
                possession_time: crmRec.possession_time || "",
                description: crmRec.description || ""
            };

            allImported.push(finalRecord);
            batchImported++;
        }

        setLogs((prev) =>
          prev.map((l) =>
            l.batchNum === i + 1
              ? {
                  ...l,
                  status: batchImported > 0 || batchSkipped === 0 ? "done" : "error",
                  message: `${batchImported} imported, ${batchSkipped} skipped`,
                }
              : l
          )
        );

        setProgress(Math.round(((i + 1) / totalBatches) * 90));

        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      }

      setStatusText("Saving to database...");
      setProgress(95);

      try {
        const saveRes = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imported: allImported, skipped: allSkipped }),
        });

        if (!saveRes.ok) throw new Error("DB save failed");
      } catch (err) {
        console.error("DB save error (non-fatal):", err);
      }

      setProgress(100);
      setStatusText("Complete!");

      onComplete({
        imported: allImported,
        skipped: allSkipped,
        total_imported: allImported.length,
        total_skipped: allSkipped.length,
      });
    };

    run().catch((err) => {
      console.error("Processing error:", err);
      onError("Unexpected error during processing. Please try again.");
    });
  }, [data, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
      
      <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
        <svg className="w-12 h-12 text-stone-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">AI is Extracting CRM Data</h2>
      <p className="text-stone-500 dark:text-stone-400 mb-10 text-sm">{statusText}</p>

      <div className="w-full max-w-md mb-4">
        <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-stone-800 dark:bg-stone-200 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-xs font-medium text-stone-400 dark:text-stone-500 text-right">
          {progress}% complete
        </div>
      </div>

      {logs.length > 0 && (
        <div 
          ref={logRef}
          className="w-full max-w-md mt-6 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-left max-h-[200px] overflow-y-auto space-y-3"
        >
          {logs.map((log) => (
            <div
              key={log.batchNum}
              className={`flex items-start gap-3 text-sm ${
                log.status === "processing" ? "text-stone-900 dark:text-white font-medium" : 
                log.status === "error" ? "text-red-600 dark:text-red-400" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              <div className="mt-1.5 flex-shrink-0 flex items-center justify-center w-2 h-2">
                {log.status === "processing" ? (
                  <span className="w-2 h-2 rounded-full bg-stone-800 dark:bg-stone-200 animate-pulse" />
                ) : log.status === "done" ? (
                  <svg className="w-3 h-3 text-stone-400 dark:text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : log.status === "error" ? (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
                )}
              </div>
              <span>
                Batch {log.batchNum} <span className="text-stone-400 dark:text-stone-500">({log.total} records)</span>: {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
