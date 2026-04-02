"use client";

import { useTransition } from "react";
import { updateOrderStatus, deleteOrder } from "./actions";
import { Trash2, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success || res.mocked) {
        toast({
          title: "Order Updated",
          description: `Status changed to ${newStatus}.`,
        });
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this order?")) {
      startTransition(async () => {
        const res = await deleteOrder(orderId);
        if (res.success || res.mocked) {
          toast({
            variant: "destructive",
            title: "Order Deleted",
            description: "The order has been purged from the system.",
          });
          router.refresh();
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <div className="relative group">
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className="appearance-none bg-white/5 border border-white/10 text-xs font-bold px-3 py-1.5 pr-8 rounded-lg cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-zinc-900 text-white">
              {opt}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="absolute right-2 top-1.5 w-4 h-4 text-purple-400 animate-spin pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2 top-1.5 w-4 h-4 text-gray-500 pointer-events-none" />
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
        title="Delete Order"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
