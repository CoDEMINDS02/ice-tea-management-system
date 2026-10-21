"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { useCatalog } from "@/components/catalog/catalog-provider";
import { recipes } from "@/data/recipes";
import {
  SIZE_LABELS,
  buildRecipeEntries,
  filterRecipeEntries,
  formatIngredientAmount,
  getVariant,
} from "@/lib/recipes";
import type { ProductSize } from "@/types/menu";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function RecipesBoard() {
  const { categories, products } = useCatalog();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [size, setSize] = useState<ProductSize>("medium");

  const entries = useMemo(
    () => buildRecipeEntries(products, recipes),
    [products],
  );

  const categoryNames = useMemo(
    () =>
      new Map(categories.map((category) => [category.id, category.name] as const)),
    [categories],
  );

  const visible = filterRecipeEntries(entries, { query, categoryId });

  // Fall back to the first visible product if the selected one is filtered out.
  const selected =
    visible.find((entry) => entry.product.id === selectedId) ?? visible[0];
  const variants = selected?.recipe?.variants ?? [];
  const activeVariant = getVariant(selected?.recipe, size) ?? variants[0];

  function clearFilters() {
    setQuery("");
    setCategoryId("all");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <div className="relative">
            <label htmlFor="recipeSearch" className="sr-only">
              Search products
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              id="recipeSearch"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div>
            <label htmlFor="recipeCategory" className="sr-only">
              Category
            </label>
            <select
              id="recipeCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {visible.length} of {entries.length} products
        </p>

        {visible.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
            <p className="text-sm text-neutral-500">
              No products match your search.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[20rem_1fr]">
            <ul className="space-y-2 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
              {visible.map(({ product, recipe }) => {
                const isSelected = selected?.product.id === product.id;

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(product.id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "border-brand-600 bg-brand-50"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-neutral-900">
                        {product.name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        {categoryNames.get(product.categoryId) ?? "Uncategorized"}
                        {!recipe ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                            No recipe
                          </span>
                        ) : null}
                        {!product.isAvailable ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            Unavailable
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {selected ? (
              <article className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  {selected.product.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {categoryNames.get(selected.product.categoryId) ??
                    "Uncategorized"}
                </p>

                {!selected.recipe || !activeVariant ? (
                  <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
                    <BookOpen
                      className="mx-auto h-6 w-6 text-neutral-400"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm text-neutral-500">
                      No recipe has been added for this product yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className="mt-4 flex flex-wrap gap-2"
                      role="group"
                      aria-label="Recipe size"
                    >
                      {variants.map((variant) => (
                        <button
                          key={variant.size}
                          type="button"
                          onClick={() => setSize(variant.size)}
                          aria-pressed={activeVariant.size === variant.size}
                          className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                            activeVariant.size === variant.size
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          {SIZE_LABELS[variant.size]}
                        </button>
                      ))}
                    </div>

                    <h4 className="mt-5 text-sm font-semibold text-neutral-900">
                      Ingredients
                    </h4>
                    <ul className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                      {activeVariant.ingredients.map((ingredient) => (
                        <li
                          key={ingredient.id}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                        >
                          <span className="text-neutral-700">
                            {ingredient.name}
                          </span>
                          <span className="font-medium text-neutral-900">
                            {formatIngredientAmount(ingredient)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="mt-5 text-sm font-semibold text-neutral-900">
                      Steps
                    </h4>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-neutral-700">
                      {activeVariant.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>

                    {selected.recipe.notes ? (
                      <p className="mt-5 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                        {selected.recipe.notes}
                      </p>
                    ) : null}
                  </>
                )}
              </article>
            ) : null}
          </div>
        )}
      </section>

      <p className="text-xs text-neutral-400">
        Demo only. Recipe amounts and steps are placeholder data. Version 1
        does not track stock or deduct ingredients.
      </p>
    </div>
  );
}