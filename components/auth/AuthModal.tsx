"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view] = useState<"sign-in" | "sign-up">("sign-in");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-surface-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-surface-400 hover:text-white z-50 bg-surface-900/50 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-1">
             {view === "sign-in" ? (
                 <SignIn 
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-surface-950 shadow-none p-6 md:p-8 w-full border-none",
                            headerTitle: "text-white font-heading text-2xl",
                            headerSubtitle: "text-surface-400",
                            formButtonPrimary: "bg-brand-500 hover:bg-brand-400 text-white",
                            formFieldLabel: "text-surface-300",
                            formFieldInput: "bg-surface-900 border-surface-800 text-white",
                            footerActionText: "text-surface-400",
                            footerActionLink: "text-brand-400 hover:text-brand-300"
                        }
                    }}
                    routing="virtual" // Keep it in modal
                    signUpUrl={undefined} // We handle switching manually if needed, or rely on Clerk's internal link which might redirect. 
                    // Actually, for modal usage with custom switching, routing="hash" or just relying on Clerk's default might be safer.
                    // Let's use standard appearance first.
                 />
             ) : (
                 <SignUp 
                    appearance={{
                        elements: {
                             rootBox: "w-full",
                             card: "bg-surface-950 shadow-none p-6 md:p-8 w-full border-none",
                             headerTitle: "text-white font-heading text-2xl",
                             headerSubtitle: "text-surface-400",
                             formButtonPrimary: "bg-brand-500 hover:bg-brand-400 text-white",
                             formFieldLabel: "text-surface-300",
                             formFieldInput: "bg-surface-900 border-surface-800 text-white",
                             footerActionText: "text-surface-400",
                             footerActionLink: "text-brand-400 hover:text-brand-300"
                        }
                    }}
                    routing="virtual"
                 />
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
