"use client";

import { useState, useTransition } from "react";
import { createCampaign, updateCampaign, deleteCampaign } from "./actions";
import { X, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  startDate: string | Date;
  endDate?: string | Date | null;
}

export function CampaignDialog({ 
  campaign, 
  mode = "create" 
}: { 
  campaign?: Campaign;
  mode?: "create" | "edit";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    platform: campaign?.platform || "facebook",
    status: campaign?.status || "active",
    budget: campaign?.budget || 1000,
    startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    endDate: campaign?.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = mode === "create" 
        ? await createCampaign(formData)
        : await updateCampaign(campaign!.id, formData);

      if (res.success) {
        toast({ title: `Campaign ${mode === "create" ? "Created" : "Updated"}`, description: "Database updated successfully." });
        setOpen(false);
        if (mode === "create") setFormData({ name: "", platform: "facebook", status: "active", budget: 1000, startDate: new Date().toISOString().split("T")[0], endDate: "" });
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      startTransition(async () => {
        const res = await deleteCampaign(campaign!.id);
        if (res.success) {
          toast({ title: "Campaign Deleted", description: "The campaign was removed from the database." });
          setOpen(false);
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={mode === "create" 
          ? "inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all"
          : "p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"}
      >
        {mode === "create" ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        {mode === "create" && "New Campaign"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div className="relative glass w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{mode === "create" ? "Create Campaign" : "Edit Campaign"}</h2>
              <button 
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Campaign Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Promotion 2024"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all font-bold"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Daily Budget (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Start Date</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-grow flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "create" ? "Launch Campaign" : "Save Changes"}
                </button>
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
