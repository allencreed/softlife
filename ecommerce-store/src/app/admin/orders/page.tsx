import Link from "next/link";
import { db } from "@/lib/db";
import { Prisma } from "../../../../generated/prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "total_desc", label: "Total: High to Low" },
  { value: "total_asc", label: "Total: Low to High" },
];

function buildOrderBy(sort: string | undefined): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "total_desc":
      return { totalCents: "desc" };
    case "total_asc":
      return { totalCents: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

type CurrentParams = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: string;
};

function buildHref(current: CurrentParams, overrides: CurrentParams): string {
  const merged: CurrentParams = { ...current, ...overrides };
  const params = new URLSearchParams();
  if (merged.status) params.set("status", merged.status);
  if (merged.q) params.set("q", merged.q);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.sort) params.set("sort", merged.sort);
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

function HiddenInputs({ omit, current }: { omit: string[]; current: CurrentParams }) {
  const entries: [string, string | undefined][] = [
    ["status", current.status],
    ["q", current.q],
    ["from", current.from],
    ["to", current.to],
    ["sort", current.sort],
  ];
  return (
    <>
      {entries
        .filter(([key, value]) => value && !omit.includes(key))
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value as string} />
        ))}
    </>
  );
}

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ status?: string; q?: string; from?: string; to?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status;
  const q = searchParams?.q?.trim() || undefined;
  const from = searchParams?.from;
  const to = searchParams?.to;
  const sort = searchParams?.sort;

  const current: CurrentParams = { status: statusFilter, q, from, to, sort };

  const and: Prisma.OrderWhereInput[] = [];

  if (statusFilter && statusFilter !== "all") {
    and.push({ status: statusFilter });
  }

  if (q) {
    and.push({
      OR: [
        { orderNumber: { contains: q } },
        { user: { email: { contains: q } } },
        { user: { name: { contains: q } } },
      ],
    });
  }

  const dateWhere: { gte?: Date; lte?: Date } = {};
  if (from) dateWhere.gte = new Date(from);
  if (to) dateWhere.lte = new Date(`${to}T23:59:59`);
  if (from || to) and.push({ createdAt: dateWhere });

  const where: Prisma.OrderWhereInput = and.length > 0 ? { AND: and } : {};

  const orderBy = buildOrderBy(sort);

  const [orders, statusCounts] = await Promise.all([
    db.order.findMany({ where, include: { user: true }, orderBy }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const totalOrders = statusCounts.reduce((sum, g) => sum + g._count, 0);

  return (
    <div>
      <h1 className="text-[28px] font-semibold leading-[1.14] text-ink mb-6">Orders</h1>

      <div className="rounded-[18px] border border-hairline bg-white p-4 mb-4 flex flex-wrap items-end gap-3">
        <form action="/admin/orders" method="get" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search order # or customer"
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:border-ink/30"
          />
          <HiddenInputs omit={["q"]} current={current} />
          <button
            type="submit"
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-muted-foreground hover:text-ink hover:border-ink/20 transition-colors"
          >
            Search
          </button>
        </form>

        <form action="/admin/orders" method="get" className="flex items-center gap-2">
          <select
            name="sort"
            defaultValue={sort ?? "newest"}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink bg-white focus:outline-none focus:border-ink/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <HiddenInputs omit={["sort"]} current={current} />
          <button
            type="submit"
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-muted-foreground hover:text-ink hover:border-ink/20 transition-colors"
          >
            Sort
          </button>
        </form>

        <form action="/admin/orders" method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/30"
          />
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/30"
          />
          <HiddenInputs omit={["from", "to"]} current={current} />
          <button
            type="submit"
            className="rounded-full border border-hairline px-3 py-1.5 text-sm text-muted-foreground hover:text-ink hover:border-ink/20 transition-colors"
          >
            Filter dates
          </button>
        </form>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { status: "all", label: `All (${totalOrders})` },
          ...statusCounts.map((g) => ({ status: g.status, label: `${g.status} (${g._count})` })),
        ].map((tab) => (
          <Link
            key={tab.status}
            href={buildHref(current, { status: tab.status === "all" ? undefined : tab.status })}
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
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-hairline hover:bg-canvas-parchment/40 transition-colors">
                  <td className="p-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{order.user.email}</td>
                  <td className="p-4 text-ink font-medium">{formatPrice(order.totalCents)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
