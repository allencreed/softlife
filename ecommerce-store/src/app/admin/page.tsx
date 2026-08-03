import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { getDashboardData, type DashboardRange } from "@/lib/admin";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersPieChart } from "@/components/admin/OrdersPieChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { DashboardLive } from "@/components/admin/DashboardLive";

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

function resolveRange(range?: string): DashboardRange {
  return range === "7d" || range === "30d" || range === "90d" || range === "all" ? range : "all";
}

export default async function AdminDashboard(props: { searchParams?: Promise<{ range?: string }> }) {
  const sp = await props.searchParams;
  const range = resolveRange(sp?.range);

  const { totalRevenue, totalOrders, totalProducts, totalCustomers, avgOrderValue, lowStockCount, revenueByDay, ordersByStatus, topProducts, recentOrders } =
    await getDashboardData(range);

  return (
    <DashboardLive range={range}>
      <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] font-semibold leading-[1.14] text-ink">Dashboard</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={opt.value === "all" ? "/admin" : `/admin?range=${opt.value}`}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                range === opt.value
                  ? "bg-primary text-white border-primary"
                  : "border-hairline text-muted-foreground hover:text-ink hover:border-ink/20"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Revenue", value: formatPrice(totalRevenue) },
          { label: "Orders", value: String(totalOrders) },
          { label: "AOV", value: formatPrice(avgOrderValue) },
          { label: "Products", value: String(totalProducts) },
          { label: "Customers", value: String(totalCustomers) },
          { label: "Low Stock", value: String(lowStockCount), warn: lowStockCount > 0 },
        ].map((s) => (
          <div key={s.label} className={`rounded-[18px] border ${s.warn ? "border-amber-200 bg-amber-50/30" : "border-hairline bg-white"} p-5`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-[28px] font-semibold leading-[1.1] mt-1 ${s.warn ? "text-amber-800" : "text-ink"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[18px] border border-hairline bg-white p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Revenue Over Time</h2>
          <RevenueChart data={revenueByDay} />
        </div>
        <div className="rounded-[18px] border border-hairline bg-white p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Orders by Status</h2>
          <OrdersPieChart data={ordersByStatus} />
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="rounded-[18px] border border-hairline bg-white p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Top Products by Revenue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left p-3 font-semibold text-ink">Product</th>
                  <th className="text-left p-3 font-semibold text-ink">Units Sold</th>
                  <th className="text-left p-3 font-semibold text-ink">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-t border-hairline">
                    <td className="p-3 text-ink">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.sold}</td>
                    <td className="p-3 text-ink font-medium">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-[18px] border border-hairline bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <RecentOrdersTable orders={recentOrders} />
      </div>
      </div>
    </DashboardLive>
  );
}
