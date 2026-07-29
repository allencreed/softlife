"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setLoading(false);
      alert("Failed to delete product");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 ml-3"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}