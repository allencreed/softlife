import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { parseImages } from "@/lib/images";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      orderNumber: `SO-${Date.now().toString(36).toUpperCase()}`,
      userId: user.id,
      status: "pending",
      totalCents: cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.images ? parseImages(item.product.images) : [],
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    success_url: `${process.env.AUTH0_BASE_URL}/account/orders?success=1`,
    cancel_url: `${process.env.AUTH0_BASE_URL}/cart`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return NextResponse.json({ url: stripeSession.url! });
}
