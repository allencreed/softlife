import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { UpdateOrderStatus } from "@/components/UpdateOrderStatus";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-ink transition-colors">&larr; Back to Orders</Link>
      <h1 className="text-[28px] font-semibold leading-[1.14] text-ink mt-2 mb-3">Order {order.orderNumber}</h1>

      <div className="flex items-center gap-3 mb-6">
        <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-[18px] border border-hairline bg-white p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Customer</h3>
          <p className="text-sm text-muted-foreground">{order.user.name || order.user.email}</p>
          <p className="text-sm text-muted-foreground">{order.user.email}</p>
        </div>
        <div className="rounded-[18px] border border-hairline bg-white p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Shipping</h3>
          <p className="text-sm text-muted-foreground">{order.shippingName}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          <p className="text-sm text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
        </div>
        <div className="rounded-[18px] border border-hairline bg-white p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Order Info</h3>
          <p className="text-sm text-muted-foreground">Placed: {formatDate(order.createdAt)}</p>
          <p className="text-sm text-muted-foreground">Status: <span className="capitalize">{order.status}</span></p>
        </div>
      </div>

      <h2 className="text-base font-semibold text-ink mb-3">Items</h2>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-[18px] border border-hairline bg-white p-4">
            <div className="flex-1">
              <p className="text-[17px] font-semibold text-ink">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity} &times; {formatPrice(item.priceCents)}</p>
            </div>
            <p className="text-[17px] font-semibold text-ink">{formatPrice(item.priceCents * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-hairline pt-6">
        <div className="flex justify-between text-[17px] font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
