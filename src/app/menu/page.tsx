import { MenuBoard } from "@/components/menu/menu-board";

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Menu &amp; Products
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Everything on the menu, grouped by category.
        </p>
      </div>

      <MenuBoard />
    </div>
  );
}
