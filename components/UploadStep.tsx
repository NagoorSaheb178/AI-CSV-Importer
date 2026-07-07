"use client";

import { useCallback, useRef, useState } from "react";
import { RawRecord } from "@/types";

interface UploadStepProps {
  onDataParsed: (data: RawRecord[], fileName: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function UploadStep({ onDataParsed }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(
    (selectedFile: File) => {
      setError("");
      setParsing(true);
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        import("papaparse").then((Papa) => {
          const result = Papa.default.parse<RawRecord>(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h: string) => h.trim(),
            dynamicTyping: false,
          });

          if (result.errors.length > 0 && result.data.length === 0) {
            setError("Failed to parse CSV. Please check the file format.");
            setParsing(false);
            return;
          }

          if (result.data.length === 0) {
            setError("The CSV file appears to be empty.");
            setParsing(false);
            return;
          }

          setParsing(false);
          onDataParsed(result.data as RawRecord[], selectedFile.name);
        }).catch(() => {
          setError("Unexpected error reading file.");
          setParsing(false);
        });
      };

      reader.onerror = () => {
        setError("Failed to read file.");
        setParsing(false);
      };

      reader.readAsText(selectedFile);
    },
    [onDataParsed]
  );

  const handleFile = useCallback(
    (f: File) => {
      if (!f.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a valid .csv file.");
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB.");
        return;
      }
      parseCSV(f);
    },
    [parseCSV]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const openFilePicker = () => {
    if (!parsing) inputRef.current?.click();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0 text-stone-600 dark:text-stone-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-1">Upload Your CSV File</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Supports any CSV format — Facebook Leads, Google Ads, Excel exports, custom spreadsheets
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={onInputChange}
        className="hidden"
      />

      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${dragging 
            ? "border-stone-800 bg-stone-50 dark:border-stone-400 dark:bg-stone-800 scale-[1.01]" 
            : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 hover:border-stone-400 hover:bg-stone-50/50 dark:hover:border-stone-600 dark:hover:bg-stone-800/50"
          }`}
        onClick={openFilePicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
      >
        <div className="w-16 h-16 mx-auto mb-6 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-600 dark:text-stone-400 transition-transform">
          {parsing ? (
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
          {dragging ? "Drop it here!" : parsing ? "Parsing CSV..." : "Drop your CSV file here"}
        </h3>
        <p className="text-stone-500 dark:text-stone-400 mb-6">or click anywhere in this box to browse files</p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full text-xs font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Supported: .csv (max 10MB)
        </div>
      </div>

      {file && !parsing && (
        <div className="flex items-center gap-4 p-4 mt-6 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl animate-in fade-in duration-300">
          <div className="w-10 h-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-stone-900 dark:text-stone-100 truncate mb-0.5">{file.name}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{formatBytes(file.size)}</div>
          </div>
          <button
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          <strong className="text-stone-700 dark:text-stone-300 font-medium">Compatible formats:</strong>{" "}
          Facebook Lead Export · Google Ads Export · Excel/Sheets CSV · Real Estate CRM · Sales Reports · Custom Spreadsheets
        </p>
      </div>
    </div>
  );
}
