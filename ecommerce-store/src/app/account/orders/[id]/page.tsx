import { notFound } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { parseImages } from "@/lib/images";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth0.getSession();
  const user = session?.user
    ? await db.user.findUnique({ where: { auth0Id: session.user.sub } })
    : null;

  if (!user) notFound();

  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[22px] sm:text-[24px] lg:text-[28px] font-normal leading-[1.14] text-ink mb-1">Order {order.orderNumber}</h1>
      <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs capitalize">
        {order.status}
      </span>
      <p className="text-sm text-muted-foreground mt-2">
        Placed on {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-[18px] border border-hairline bg-white p-4">
            <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {item.product.images && (
                <img
                   src={parseImages(item.product.images)[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-normal text-ink">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(item.priceCents)} each</p>
            </div>
            <p className="text-[17px] font-normal text-ink">{formatPrice(item.priceCents * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-hairline pt-6">
        <div className="flex justify-between text-[17px] font-normal text-ink">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
