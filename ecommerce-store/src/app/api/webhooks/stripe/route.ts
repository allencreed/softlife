import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string; userId?: string } };
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (orderId && userId) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "paid" },
      });

      const items = await db.orderItem.findMany({
        where: { orderId },
      });
      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        });
      }

      const cart = await db.cart.findUnique({ where: { userId } });
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
