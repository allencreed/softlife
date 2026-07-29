import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { getDashboardData } from "@/lib/admin";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersPieChart } from "@/components/admin/OrdersPieChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";

export default async function AdminDashboard() {
  const [{ totalRevenue, totalOrders, totalProducts, totalCustomers, avgOrderValue, lowStockCount, revenueByDay, ordersByStatus, topProducts, recentOrders }] = await Promise.all([
    getDashboardData(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-[28px] font-semibold leading-[1.14] text-ink">Dashboard</h1>

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
  );
}
