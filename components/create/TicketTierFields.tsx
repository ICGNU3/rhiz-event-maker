import { TicketTier } from "@/lib/types";
import { Plus, Trash2, Link } from "lucide-react";
import { useState } from "react";

interface TicketTierFieldsProps {
  initialTiers?: TicketTier[];
  onChange?: (tiers: TicketTier[]) => void;
}

export function TicketTierFields({ initialTiers = [], onChange }: TicketTierFieldsProps) {
  const [tiers, setTiers] = useState<TicketTier[]>(initialTiers);

  const addTier = () => {
    const newTier: TicketTier = {
      id: crypto.randomUUID(),
      name: "",
      price: 0,
      currency: "USD",
      features: [],
      capacity: 100,
      description: "",
      paymentUrl: "",
    };
    const updated = [...tiers, newTier];
    setTiers(updated);
    onChange?.(updated);
  };

  const removeTier = (id: string) => {
    const updated = tiers.filter((t) => t.id !== id);
    setTiers(updated);
    onChange?.(updated);
  };

  const updateTier = (id: string, updates: Partial<TicketTier>) => {
    const updated = tiers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTiers(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-mono text-brand-300 uppercase tracking-widest">
          07 // Ticketing
        </h3>
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-2 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          ADD TIER
        </button>
      </div>

      {tiers.length === 0 && (
        <div className="p-8 border border-dashed border-surface-700 rounded-xl text-center">
          <p className="text-surface-500 mb-4">No ticket tiers configured.</p>
          <button
            type="button"
            onClick={addTier}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-lg text-sm transition-colors"
          >
            Create First Ticket
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            className="p-6 bg-surface-900/50 border border-surface-800 rounded-xl space-y-4 animate-fade-in group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider mb-1 block">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    placeholder="e.g. VIP Access"
                    className="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider mb-1 block">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={tier.price}
                    onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTier(tier.id)}
                className="ml-4 text-surface-500 hover:text-red-400 transition-colors p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-surface-500 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <textarea
                value={tier.description || ""}
                onChange={(e) => updateTier(tier.id, { description: e.target.value })}
                placeholder="What's included in this ticket?"
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none h-20 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Link className="w-3 h-3" /> External Payment URL
              </label>
              <input
                type="url"
                value={tier.paymentUrl || ""}
                onChange={(e) => updateTier(tier.id, { paymentUrl: e.target.value })}
                placeholder="https://buy.stripe.com/..."
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none font-mono text-sm"
              />
              <p className="text-[10px] text-surface-500 mt-1">
                Link to an external checkout (Stripe Payment Link, Luma, etc.)
              </p>
            </div>
            
            {/* Hidden inputs for form submission if needed, though we sync via state mainly. 
                For server actions to pick it up via FormData, strictly we might need hidden inputs 
                unless we rely on the parent component to serialize it. 
                Ideally, the parent ArchitectModeFields uses these values to update hidden inputs or state.
            */}
             <input type="hidden" name={`tiers[${index}][id]`} value={tier.id} />
             <input type="hidden" name={`tiers[${index}][name]`} value={tier.name} />
             <input type="hidden" name={`tiers[${index}][price]`} value={tier.price} />
             <input type="hidden" name={`tiers[${index}][description]`} value={tier.description || ""} />
             <input type="hidden" name={`tiers[${index}][paymentUrl]`} value={tier.paymentUrl || ""} />
          </div>
        ))}
      </div>
    </div>
  );
}
