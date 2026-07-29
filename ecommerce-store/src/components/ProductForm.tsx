"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function ProductForm({
  product,
  categories,
}: {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    images: string;
    inventory: number;
    featured: boolean;
    categoryId: string;
  };
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const priceDollars = parseFloat(form.get("priceCents") as string);

    const body = {
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      description: (form.get("description") as string) || "",
      priceCents: Math.round(priceDollars * 100),
      images: (form.get("images") as string) || "",
      inventory: parseInt(form.get("inventory") as string) || 0,
      featured: form.get("featured") === "on",
      categoryId: form.get("categoryId") as string,
    };

    const url = product
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("Failed to save product");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={product?.slug} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} />
      </div>
      <div>
        <Label htmlFor="priceCents">Price (dollars)</Label>
        <Input id="priceCents" name="priceCents" type="number" step="0.01" defaultValue={product ? product.priceCents / 100 : ""} required />
      </div>
      <div>
        <Label htmlFor="images">Image URL</Label>
        <Input id="images" name="images" defaultValue={product?.images || ""} />
      </div>
      <div>
        <Label htmlFor="inventory">Inventory</Label>
        <Input id="inventory" name="inventory" type="number" defaultValue={product?.inventory ?? 0} />
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" defaultValue={product?.categoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="featured" id="featured" defaultChecked={product?.featured} className="h-4 w-4 rounded border-hairline text-primary" />
        <Label htmlFor="featured">Featured product</Label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-primary px-[22px] py-[11px] text-sm text-white hover:brightness-110 active:scale-[0.96] transition-all disabled:opacity-50"
      >
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
