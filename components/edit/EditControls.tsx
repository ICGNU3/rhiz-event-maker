"use client";

import { Save, Loader2 } from "lucide-react";

interface EditControlsProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function EditControls({ isSaving, onSave, onCancel }: EditControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-surface-900/90 backdrop-blur-xl p-2 pl-4 pr-2 rounded-full border border-white/10 shadow-2xl animate-slide-up">
      <span className="text-sm font-medium text-surface-300 mr-2">Editing Mode</span>
      
      <button
        onClick={onCancel}
        disabled={isSaving}
        className="px-4 py-2 rounded-full text-sm font-medium text-surface-200 hover:bg-surface-800 transition-colors"
      >
        Cancel
      </button>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold bg-brand-500 hover:bg-brand-400 text-black transition-all shadow-glow-sm hover:shadow-glow-md disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
}
