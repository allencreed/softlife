import { db } from "./db";

export type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  avgOrderValue: number;
  lowStockCount: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const [productCount, orderCount, customerCount, lowStockCount, orders] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count({ where: { role: "customer" } }),
    db.product.count({ where: { inventory: { lte: 5 } } }),
    db.order.findMany({ include: { user: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCents, 0);

  const revenueByDay = aggregateRevenueByDay(orders);

  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }
  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const productRevenue: Record<string, { name: string; sold: number; revenue: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      const key = item.productId;
      if (!productRevenue[key]) productRevenue[key] = { name: item.product.name, sold: 0, revenue: 0 };
      productRevenue[key].sold += item.quantity;
      productRevenue[key].revenue += item.priceCents * item.quantity;
    }
  }
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const recentOrders = orders.slice(0, 10).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user.name || o.user.email,
    total: o.totalCents,
    status: o.status,
    date: o.createdAt.toISOString().split("T")[0],
  }));

  return { totalRevenue, totalOrders: orderCount, totalProducts: productCount, totalCustomers: customerCount, avgOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0, lowStockCount, revenueByDay, ordersByStatus, topProducts, recentOrders };
}

function aggregateRevenueByDay(orders: { createdAt: Date; totalCents: number }[]): { date: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (const o of orders) {
    const day = o.createdAt.toISOString().split("T")[0];
    map.set(day, (map.get(day) || 0) + o.totalCents);
  }
  return Array.from(map.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
