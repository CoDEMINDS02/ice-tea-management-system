"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { useCatalog } from "@/components/catalog/catalog-provider";
import { formatCurrency } from "@/lib/format";
import type { Product, ProductSize } from "@/types/menu";

const SIZE_LABELS: Record<ProductSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {label} ({count})
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-4 shadow-sm ${
        product.isAvailable ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-neutral-900">{product.name}</p>
        <p className="shrink-0 font-semibold text-neutral-900">
          {formatCurrency(product.price)}
        </p>
      </div>

      {product.description ? (
        <p className="mt-1 text-sm text-neutral-500">{product.description}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            product.isAvailable
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {product.isAvailable ? "Available" : "Unavailable"}
        </span>

        {product.sizes && product.sizes.length > 0 ? (
          <span className="text-xs text-neutral-500">
            {product.sizes.map((size) => SIZE_LABELS[size]).join(" · ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function MenuBoard() {
  const { categories, products } = useCatalog();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const query = search.trim().toLowerCase();

  const matches = (product: Product) =>
    (!query ||
      product.name.toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query)) &&
    (!availableOnly || product.isAvailable);

  const available = products.filter((p) => p.isAvailable).length;

  const visibleCategories = categories.filter(
    (category) => categoryId === "all" || category.id === categoryId,
  );

  const groups = visibleCategories
    .map((category) => ({
      category,
      items: products.filter(
        (product) => product.categoryId === category.id && matches(product),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isFiltered = query !== "" || categoryId !== "all" || availableOnly;

  function clearFilters() {
    setSearch("");
    setCategoryId("all");
    setAvailableOnly(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Products" value={products.length} />
        <SummaryCard title="Available" value={available} />
        <SummaryCard title="Unavailable" value={products.length - available} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name or description"
            aria-label="Search products"
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterButton
            label="All"
            count={products.length}
            active={categoryId === "all"}
            onClick={() => setCategoryId("all")}
          />
          {categories.map((category) => (
            <FilterButton
              key={category.id}
              label={category.name}
              count={
                products.filter((p) => p.categoryId === category.id).length
              }
              active={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
            />
          ))}
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 accent-brand-600"
          />
          Available only
        </label>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">
            No products match your search or filters.
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        groups.map(({ category, items }) => (
          <section key={category.id}>
            <div className="mb-3">
              <h3 className="text-base font-semibold text-neutral-900">
                {category.name}
                {category.isActive ? null : (
                  <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    Hidden
                  </span>
                )}
              </h3>
              {category.description ? (
                <p className="mt-0.5 text-sm text-neutral-500">
                  {category.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
