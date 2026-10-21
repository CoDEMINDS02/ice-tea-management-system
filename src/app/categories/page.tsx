import { CategoriesBoard } from "@/components/categories/categories-board";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Categories</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Group your products. Hide a category instead of deleting it.
        </p>
      </div>

      <CategoriesBoard />
    </div>
  );
}