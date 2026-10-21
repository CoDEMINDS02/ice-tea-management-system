import { RecipesBoard } from "@/components/recipes/recipes-board";

// Opt this page out of Next.js's instant-navigation check (a dev-mode warning).
export const instant = false;

export default function RecipesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Recipes</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ingredients and preparation steps for each menu product and size.
        </p>
      </div>

      <RecipesBoard />
    </div>
  );
}