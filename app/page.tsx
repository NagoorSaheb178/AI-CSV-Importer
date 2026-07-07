"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AppStep, ImportResult, RawRecord } from "@/types";


// All step components are purely client-side — disable SSR to prevent
// hydration mismatches caused by browser extensions manipulating the DOM
const UploadStep = dynamic(() => import("@/components/UploadStep"), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const PreviewStep = dynamic(() => import("@/components/PreviewStep"), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const ProcessingStep = dynamic(() => import("@/components/ProcessingStep"), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const ResultsStep = dynamic(() => import("@/components/ResultsStep"), {
  ssr: false,
  loading: () => <StepSkeleton />,
});

function StepSkeleton() {
  return (
    <div className="py-16 text-center text-stone-400">
      <div className="animate-pulse flex justify-center mb-4">
        <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-sm">Loading...</div>
    </div>
  );
}

const STEPS: { key: AppStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "processing", label: "Processing" },
  { key: "results", label: "Results" },
];

function getStepIndex(step: AppStep) {
  return STEPS.findIndex((s) => s.key === step);
}

export default function Home() {
  const [step, setStep] = useState<AppStep>("upload");
  const [csvData, setCsvData] = useState<RawRecord[]>([]);
  const [fileName, setFileName] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [aiError, setAiError] = useState("");

  const currentIdx = getStepIndex(step);

  const handleDataParsed = (data: RawRecord[], name: string) => {
    setCsvData(data);
    setFileName(name);
    setStep("preview");
  };

  const handleConfirm = () => {
    setAiError("");
    setStep("processing");
  };

  const handleComplete = (result: ImportResult) => {
    setImportResult(result);
    setStep("results");
  };

  const handleError = (err: string) => {
    setAiError(err);
    setStep("preview");
  };

  const handleReset = () => {
    setStep("upload");
    setCsvData([]);
    setFileName("");
    setImportResult(null);
    setAiError("");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 font-sans selection:bg-stone-200 dark:selection:bg-stone-800 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-stone-800 dark:bg-stone-100 rounded-md flex items-center justify-center text-white dark:text-stone-900 font-bold transition-transform group-hover:scale-105">
              G
            </div>
            <div className="font-semibold text-lg tracking-tight">GrowEasy</div>
          </a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-xs font-medium text-stone-500 dark:text-stone-400 shadow-sm transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500"></span>
              CSV Importer
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 transition-colors duration-300">
            Powered by AI · No mapping needed
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-white mb-4 transition-colors duration-300">
            Import Leads from Any CSV
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Upload any CSV — Facebook, Google Ads, Excel, or custom spreadsheets. 
            Our intelligent system maps your data to the GrowEasy CRM format automatically.
          </p>
        </section>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, idx) => {
            const isActive = s.key === step;
            const isCompleted = idx < currentIdx;
            
            return (
              <div key={s.key} className="flex items-center">
                {idx > 0 && (
                  <div className={`w-4 sm:w-8 md:w-12 h-[2px] mx-1 sm:mx-2 transition-colors duration-300 ${isCompleted ? 'bg-stone-800 dark:bg-stone-400' : 'bg-stone-200 dark:bg-stone-800'}`} />
                )}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors duration-300
                    ${isActive ? 'border-stone-800 bg-stone-800 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' : 
                      isCompleted ? 'border-stone-800 bg-white text-stone-800 dark:border-stone-100 dark:bg-stone-950 dark:text-stone-100' : 
                      'border-stone-200 bg-white text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600'}`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className={`text-xs font-medium absolute mt-10 transition-colors duration-300 ${isActive ? 'text-stone-900 dark:text-stone-200' : 'text-stone-400 dark:text-stone-600'}`}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-10 mb-12 relative z-10 transition-colors duration-300">
          {aiError && step === "preview" && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{aiError}</span>
            </div>
          )}

          {step === "upload" && <UploadStep onDataParsed={handleDataParsed} />}
          {step === "preview" && (
            <PreviewStep
              data={csvData}
              fileName={fileName}
              onConfirm={handleConfirm}
              onBack={handleReset}
            />
          )}
          {step === "processing" && (
            <ProcessingStep
              data={csvData}
              onComplete={handleComplete}
              onError={handleError}
            />
          )}
          {step === "results" && importResult && (
            <ResultsStep result={importResult} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-400 dark:text-stone-500 text-sm border-t border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <p>
          Built for GrowEasy · AI CSV Importer Assignment ·{" "}
          <a href="https://groweasy.ai" target="_blank" rel="noopener noreferrer" className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium transition-colors">
            groweasy.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
