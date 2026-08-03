import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import {
  BulkDeleteProducts,
  BulkRowCheckbox,
  BulkSelectAllCheckbox,
} from "@/components/admin/BulkDeleteProducts";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const allProductIds = products.map((p) => p.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-semibold leading-[1.14] text-ink">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-primary px-[22px] py-[11px] text-sm text-white hover:brightness-110 active:scale-[0.96] transition-all"
        >
          Add Product
        </Link>
      </div>

      <BulkDeleteProducts allProductIds={allProductIds}>
        <div className="rounded-[18px] border border-hairline overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-canvas-parchment">
                <th className="p-4 w-10">
                  <BulkSelectAllCheckbox />
                </th>
                <th className="text-left p-4 font-semibold text-ink">Name</th>
                <th className="text-left p-4 font-semibold text-ink">
                  Category
                </th>
                <th className="text-left p-4 font-semibold text-ink">Price</th>
                <th className="text-left p-4 font-semibold text-ink">Stock</th>
                <th className="text-left p-4 font-semibold text-ink">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-sm text-muted-foreground"
                  >
                    No products yet
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-hairline hover:bg-canvas-parchment/40 transition-colors"
                  >
                    <td className="p-4">
                      <BulkRowCheckbox productId={p.id} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.featured && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                            title="Featured"
                          />
                        )}
                        <span className="text-ink font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {p.category.name}
                    </td>
                    <td className="p-4 text-ink font-medium">
                      {formatPrice(p.priceCents)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.inventory > 10
                            ? "bg-green-50 text-green-700"
                            : p.inventory > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {p.inventory}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={p.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BulkDeleteProducts>
    </div>
  );
}
