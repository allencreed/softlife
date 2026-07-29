"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No revenue data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barCategoryGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 100}`} />
        <Tooltip formatter={(value: number) => [`$${(value / 100).toFixed(2)}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-hairline)", fontSize: 13 }} />
        <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
