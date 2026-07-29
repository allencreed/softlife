"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export function OrdersPieChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>;
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="status">
            {data.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status] || "#94a3b8"} />)}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, "Orders"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-hairline)", fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-sm">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] || "#94a3b8" }} />
            <span className="capitalize text-muted-foreground">{d.status}</span>
            <span className="font-medium text-ink ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
