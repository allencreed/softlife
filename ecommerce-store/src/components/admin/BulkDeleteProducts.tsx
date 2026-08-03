"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type BulkDeleteContextValue = {
  allProductIds: string[];
  selectedIds: string[];
  allSelected: boolean;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: (checked: boolean) => void;
};

const BulkDeleteContext = createContext<BulkDeleteContextValue | null>(null);

function useBulkDelete(): BulkDeleteContextValue {
  const ctx = useContext(BulkDeleteContext);
  if (!ctx) {
    throw new Error(
      "Bulk delete checkboxes must be rendered inside <BulkDeleteProducts>",
    );
  }
  return ctx;
}

type DeleteBody = { ids: string[] } | { all: true };

export function BulkDeleteProducts({
  allProductIds,
  children,
}: {
  allProductIds: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const allSelected =
    allProductIds.length > 0 && selectedIds.length === allProductIds.length;

  const value = useMemo<BulkDeleteContextValue>(
    () => ({
      allProductIds,
      selectedIds,
      allSelected,
      isSelected: (id: string) => selectedIds.includes(id),
      toggle: (id: string) =>
        setSelectedIds((prev) =>
          prev.includes(id)
            ? prev.filter((x) => x !== id)
            : [...prev, id],
        ),
      toggleAll: (checked: boolean) =>
        setSelectedIds(checked ? [...allProductIds] : []),
    }),
    [allProductIds, selectedIds, allSelected],
  );

  async function deleteProducts(body: DeleteBody) {
    if (loading) return;
    const count = "all" in body ? allProductIds.length : body.ids.length;
    if (
      !confirm(
        `Delete ${count} product${count === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert("Failed to delete products");
      }
    } catch {
      alert("Failed to delete products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BulkDeleteContext.Provider value={value}>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => deleteProducts({ ids: selectedIds })}
          disabled={loading || selectedIds.length === 0}
          className="inline-flex items-center justify-center rounded-[14px] border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-canvas-parchment/40 transition-all disabled:opacity-50"
        >
          {loading
            ? "Deleting..."
            : `Delete Selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
        </button>
        <button
          type="button"
          onClick={() => deleteProducts({ all: true })}
          disabled={loading || allProductIds.length === 0}
          className="inline-flex items-center justify-center rounded-[14px] border border-hairline bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete All"}
        </button>
      </div>
      {children}
    </BulkDeleteContext.Provider>
  );
}

export function BulkSelectAllCheckbox() {
  const { allSelected, toggleAll } = useBulkDelete();
  return (
    <input
      type="checkbox"
      aria-label="Select all products"
      checked={allSelected}
      onChange={(e) => toggleAll(e.target.checked)}
      className="h-4 w-4 cursor-pointer accent-primary"
    />
  );
}

export function BulkRowCheckbox({ productId }: { productId: string }) {
  const { isSelected, toggle } = useBulkDelete();
  return (
    <input
      type="checkbox"
      aria-label="Select product"
      checked={isSelected(productId)}
      onChange={() => toggle(productId)}
      className="h-4 w-4 cursor-pointer accent-primary"
    />
  );
}
