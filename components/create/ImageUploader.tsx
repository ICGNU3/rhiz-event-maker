"use client";

import { useState, useCallback } from "react";
// import { useDropzone } from "react-dropzone";
// Since package.json didn't show react-dropzone, I'll implement a simple one with valid HTML5 API or check if I should install it.
// Checking package.json... it wasn't there. I'll stick to a simple input for now or standard drag/drop using standard generic HTML5 events to avoid new deps if possible,
// but for "Vision Mode" a nice UI is expected. I'll use standard events.

import { extractDetailsFromImage } from "@/app/actions/events"; 
import { ScrapedEventData } from "@/lib/types";
// Wait, I can't import server action directly like this in some setups if it's not exposed as a simpler function,
// but in Next.js App Router we can.

interface ImageUploaderProps {
  onExtractionComplete: (data: ScrapedEventData) => void;
}

export function ImageUploader({ onExtractionComplete }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await extractDetailsFromImage(formData);

      if (result.success && result.data) {
        // null vs undefined mismatch fix
        const sanitized: ScrapedEventData = {
           title: result.data.eventName ?? undefined,
           date: result.data.eventDate ?? undefined,
           location: result.data.eventLocation ?? undefined,
           description: result.data.description ?? undefined,
           hosts: [], // Default or map if available
           goals: undefined, // BAML result doesn't have goals in PartialEventDetails
           audience: undefined,
           tone: result.data.vibe ?? undefined,
        };
        onExtractionComplete(sanitized);
      } else {
        setError(result.error || "Failed to extract details");
      }
    } catch {
      setError("Something went wrong during extraction");
    } finally {
      setIsAnalyzing(false);
    }
  }, [onExtractionComplete]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full mb-8">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-xl p-8 transition-all duration-300
          ${isDragActive 
            ? "border-brand-400 bg-brand-500/10 scale-[1.01]" 
            : "border-surface-700 bg-surface-900/30 hover:border-surface-500 hover:bg-surface-800/50"}
        `}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={onInputChange}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {preview ? (
            <div className="relative w-32 h-32 mb-2 rounded-lg overflow-hidden border border-surface-600 shadow-xl">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={preview} alt="Preview" className="w-full h-full object-cover" />
               {isAnalyzing && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                   <div className="animate-spin text-brand-400">✺</div>
                 </div>
               )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/20 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div>
             <h3 className="text-lg font-medium text-white group-hover:text-brand-300 transition-colors">
               {isAnalyzing ? "Analyzing Event Flyer..." : "Upload Event Flyer"}
             </h3>
             <p className="text-sm text-surface-400 px-8">
               {isAnalyzing 
                 ? "Gemini is extracting details..." 
                 : "Drag & drop or click to upload. We'll extract details automatically."}
             </p>
          </div>
        </div>

        {error && (
             <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50">
                    {error}
                </span>
             </div>
        )}
      </div>
    </div>
  );
}
