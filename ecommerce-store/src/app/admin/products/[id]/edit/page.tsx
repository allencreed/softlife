import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-[28px] font-semibold leading-[1.14] text-ink mb-8">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
