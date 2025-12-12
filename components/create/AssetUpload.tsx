"use client";

import { useState, useCallback } from "react";

interface AssetUploadProps {
  label: string;
  name: string;
  description?: string;
}

export function AssetUpload({ label, name, description }: AssetUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [values, setValues] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        
        if (!res.ok) throw new Error("Upload failed");
        
        const { url } = await res.json();
        setValues(url); // Store the remote URL
        console.log("Asset uploaded:", url);
    } catch (e) {
        console.error("Upload error:", e);
        // Revert preview? Or show error state?
        // For now, keep preview but form submission might fail validation if URL is empty?
        // Actually the hidden input won't be set if we don't call setValues(url).
    } finally {
        setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-mono text-surface-500 uppercase tracking-widest">
        {label}
      </label>
      
      <input type="hidden" name={name} value={values || ""} />
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={onDrop}
        className={`
            relative group cursor-pointer border-dashed border-2 rounded-xl transition-all overflow-hidden
            ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-surface-800 bg-surface-900/50 hover:border-surface-700'}
            ${preview ? 'h-48' : 'h-32'}
        `}
      >
         <input 
            type="file" 
            accept="image/*" 
            onChange={onInputChange}
            className="absolute inset-0 z-20 opacity-0 cursor-pointer"
         />
         
         {preview ? (
             <div className="absolute inset-0 z-10">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-sm font-medium">Change Image</span>
                 </div>
                 {isUploading && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-30">
                         <div className="animate-spin text-brand-400">Wait</div>
                     </div>
                 )}
             </div>
         ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-500 gap-2">
                 <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center">
                    <span className="text-xl">+</span>
                 </div>
                 <span className="text-sm">Upload {label}</span>
             </div>
         )}
      </div>
      {description && <p className="text-xs text-surface-500">{description}</p>}
    </div>

  );
}
