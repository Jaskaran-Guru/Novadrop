"use client";

import { useTransition } from "react";
import { cancelAndRefundOrder } from "@/app/account/actions";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

export function RefundButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleRefund = () => {
    if (confirm("Are you sure you want to cancel and delete this pending order? A refund will be processed immediately.")) {
      startTransition(async () => {
        try {
          const res = await cancelAndRefundOrder(orderId);
          if (res.success) {
            toast({
              title: "Order Processed",
              description: "The order has been deleted and a refund has been initiated to your original payment method.",
              variant: "default"
            });
            router.refresh();
          } else {
            toast({
              title: "Error Occurred",
              description: res.error || "Failed to process the refund. Please try again later.",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "System Error",
            description: "Something went wrong while communicating with our server.",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <button
      onClick={handleRefund}
      disabled={isPending}
      className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      Cancel & Refund
    </button>
  );
}
