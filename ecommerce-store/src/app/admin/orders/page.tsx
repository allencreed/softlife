import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminOrdersPage(props: { searchParams?: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status;

  const where = statusFilter && statusFilter !== "all" ? { status: statusFilter } : {};

  const [orders, statusCounts] = await Promise.all([
    db.order.findMany({ where, include: { user: true }, orderBy: { createdAt: "desc" } }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const totalOrders = statusCounts.reduce((s, g) => s + g._count, 0);

  return (
    <div>
      <h1 className="text-[28px] font-semibold leading-[1.14] text-ink mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ status: "all", label: `All (${totalOrders})` }, ...statusCounts.map((g) => ({ status: g.status, label: `${g.status} (${g._count})` }))].map((tab) => (
          <Link
            key={tab.status}
            href={tab.status === "all" ? "/admin/orders" : `/admin/orders?status=${tab.status}`}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              (!statusFilter && tab.status === "all") || statusFilter === tab.status
                ? "bg-primary text-white border-primary"
                : "border-hairline text-muted-foreground hover:text-ink hover:border-ink/20"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="rounded-[18px] border border-hairline overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-canvas-parchment">
              <th className="text-left p-4 font-semibold text-ink">Order</th>
              <th className="text-left p-4 font-semibold text-ink">Customer</th>
              <th className="text-left p-4 font-semibold text-ink">Total</th>
              <th className="text-left p-4 font-semibold text-ink">Status</th>
              <th className="text-left p-4 font-semibold text-ink">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No orders found</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-t border-hairline hover:bg-canvas-parchment/40 transition-colors">
                <td className="p-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-4 text-muted-foreground">{order.user.email}</td>
                <td className="p-4 text-ink font-medium">{formatPrice(order.totalCents)}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
