"use client";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function RecentOrdersTable({ orders }: {
  orders: { id: string; orderNumber: string; customer: string; total: number; status: string; date: string }[];
}) {
  const router = useRouter();
  if (orders.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left p-3 font-semibold text-ink">Order</th>
            <th className="text-left p-3 font-semibold text-ink">Customer</th>
            <th className="text-left p-3 font-semibold text-ink">Date</th>
            <th className="text-left p-3 font-semibold text-ink">Total</th>
            <th className="text-left p-3 font-semibold text-ink">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-hairline cursor-pointer hover:bg-canvas-parchment/50" onClick={() => router.push(`/admin/orders/${o.id}`)}>
              <td className="p-3 font-medium text-ink">{o.orderNumber}</td>
              <td className="p-3 text-muted-foreground">{o.customer}</td>
              <td className="p-3 text-muted-foreground">{o.date}</td>
              <td className="p-3 text-ink">{formatPrice(o.total)}</td>
              <td className="p-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-800"}`}>{o.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
