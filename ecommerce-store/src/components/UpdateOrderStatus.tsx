"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextStatus: Record<string, string> = {
    pending: "paid",
    paid: "shipped",
    shipped: "delivered",
  };

  const next = nextStatus[currentStatus];
  const canCancel = currentStatus === "pending" || currentStatus === "paid";

  async function handleUpdate(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {next && (
        <button
          onClick={() => handleUpdate(next)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-primary bg-transparent px-[14px] py-1.5 text-sm text-primary hover:bg-primary/5 active:scale-[0.96] transition-all disabled:opacity-50"
        >
          Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
        </button>
      )}
      {next === undefined && currentStatus !== "cancelled" && (
        <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-medium capitalize">
          Delivered
        </span>
      )}
      {canCancel && (
        <button
          onClick={() => handleUpdate("cancelled")}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-transparent px-[14px] py-1.5 text-sm text-red-600 hover:bg-red-50 active:scale-[0.96] transition-all disabled:opacity-50"
        >
          Cancel Order
        </button>
      )}
      {currentStatus === "cancelled" && (
        <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-medium capitalize">
          Cancelled
        </span>
      )}
    </div>
  );
}
