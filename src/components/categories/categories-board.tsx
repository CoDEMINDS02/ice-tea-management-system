"use client";

import { useState, type SyntheticEvent } from "react";
import { Eye, EyeOff, Pencil, Plus, X } from "lucide-react";

import { useCatalog } from "@/components/catalog/catalog-provider";
import {
  buildCategory,
  countProducts,
  validateCategory,
  type CategoryErrors,
} from "@/lib/category-builder";
import type { Category } from "@/types/menu";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function CategoryCard({
  category,
  productCount,
  onEdit,
  onToggle,
}: {
  category: Category;
  productCount: number;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <li
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        category.isActive
          ? "border-neutral-200 bg-white"
          : "border-neutral-200 bg-neutral-50"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`text-sm font-semibold ${
              category.isActive ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            {category.name}
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              category.isActive
                ? "bg-brand-50 text-brand-700"
                : "bg-neutral-200 text-neutral-600"
            }`}
          >
            {category.isActive ? "Active" : "Hidden"}
          </span>
        </div>
        {category.description ? (
          <p className="mt-1 text-sm text-neutral-500">
            {category.description}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-neutral-400">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${category.name}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            category.isActive
              ? `Hide ${category.name}`
              : `Show ${category.name}`
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          {category.isActive ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
          {category.isActive ? "Hide" : "Show"}
        </button>
      </div>
    </li>
  );
}

export function CategoriesBoard() {
  const { categories, products, addCategory, updateCategory, setCategoryActive } =
    useCatalog();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [message, setMessage] = useState("");

  const isFormOpen = isAdding || editingId !== null;
  const activeCount = categories.filter((c) => c.isActive).length;

  function closeForm() {
    setIsAdding(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setErrors({});
  }

  function openAdd() {
    closeForm();
    setMessage("");
    setIsAdding(true);
  }

  function openEdit(category: Category) {
    setMessage("");
    setErrors({});
    setIsAdding(false);
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
  }

  function toggleCategory(category: Category) {
    setCategoryActive(category.id, !category.isActive);
    setMessage(
      category.isActive
        ? `"${category.name}" is now hidden.`
        : `"${category.name}" is now visible.`,
    );
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = { name, description };
    const foundErrors = validateCategory(
      input,
      categories,
      editingId ?? undefined,
    );
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    if (editingId) {
      updateCategory(editingId, input);
      setMessage(`"${input.name.trim()}" was updated.`);
    } else {
      addCategory(buildCategory(input, categories));
      setMessage(`"${input.name.trim()}" was added.`);
    }

    closeForm();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
          {" · "}
          {activeCount} active
          {" · "}
          {categories.length - activeCount} hidden
        </p>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add category
          </button>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={message ? "text-sm text-brand-700" : "sr-only"}
      >
        {message}
      </p>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              {editingId ? "Edit category" : "New category"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="categoryName"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hot Drinks"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "categoryName-error" : undefined}
                className={inputClass}
              />
              {errors.name && (
                <p
                  id="categoryName-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="categoryDescription"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Description (optional)
              </label>
              <textarea
                id="categoryDescription"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "categoryDescription-error" : undefined
                }
                className={inputClass}
              />
              {errors.description && (
                <p
                  id="categoryDescription-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {editingId ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            No categories yet. Add your first one to organise the menu.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={countProducts(category.id, products)}
              onEdit={() => openEdit(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-400">
        Demo only. Categories are saved in this browser. Hidden categories are
        never deleted, so existing products and orders keep working.
      </p>
    </div>
  );
}