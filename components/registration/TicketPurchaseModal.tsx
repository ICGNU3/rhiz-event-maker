"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Ticket, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { TicketTier } from "@/lib/types";
import { createEventCheckoutSession } from "@/app/actions/stripe";

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  tiers: TicketTier[];
}

export function TicketPurchaseModal({
  isOpen,
  onClose,
  eventId,
  tiers
}: TicketPurchaseModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(tiers[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out free tiers if any, or handle them differently? 
  // For now assuming all tiers in this modal are paid via Stripe.
  // If price is 0, we might want to just register them directly, but let's stick to Stripe Checkout 
  // which can handle 0 price if configured, or we just handle it here.
  // The user prompt specifically asked about the 5% fee on payment, so paid tickets are the focus.

  const handlePurchase = async () => {
    if (!selectedTierId) return;
    
    try {
      setIsSubmitting(true);
      const result = await createEventCheckoutSession(eventId, selectedTierId, quantity);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Purchase failed", error);
      // Ideally show a toast here
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTier = tiers.find(t => t.id === selectedTierId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="relative p-6 md:p-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">Select Tickets</h2>
                  <p className="text-zinc-400 text-sm">
                    Choose your access level for this event.
                  </p>
                </div>

                <div className="grid gap-4 mb-8">
                    {tiers.map((tier) => (
                        <div 
                            key={tier.id}
                            onClick={() => setSelectedTierId(tier.id)}
                            className={clsx(
                                "cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group",
                                selectedTierId === tier.id 
                                    ? "bg-zinc-800 border-brand-500 ring-1 ring-brand-500" 
                                    : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-500"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    selectedTierId === tier.id ? "bg-brand-500 text-black" : "bg-zinc-700 text-zinc-400"
                                )}>
                                    <Ticket size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{tier.name}</h3>
                                    <p className="text-xs text-zinc-400">{tier.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-white">
                                    {tier.price === 0 ? "Free" : `$${tier.price}`}
                                </div>
                                {selectedTierId === tier.id && (
                                    <div className="text-xs text-brand-400 font-medium flex items-center justify-end gap-1 mt-1">
                                        <Check size={12} /> Selected
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-zinc-400">Quantity</label>
                        <select 
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-500"
                        >
                            {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={isSubmitting || !selectedTierId}
                      className={clsx(
                        "flex items-center justify-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                        isSubmitting && "cursor-wait"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Checkout {selectedTier && selectedTier.price > 0 && `• $${selectedTier.price * quantity}`}</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
