import type { Product, ProductSize } from "@/types/menu";
import type { Recipe, RecipeIngredient, RecipeVariant } from "@/types/recipe";

/** A product together with its recipe, if it has one yet. */
export type RecipeEntry = {
  product: Product;
  recipe: Recipe | undefined;
};

export type RecipeFilters = {
  /** Matches against the product name, case-insensitive. */
  query: string;
  /** A Category.id, or "all" for no category filter. */
  categoryId: string;
};

export const SIZE_LABELS: Record<ProductSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

/** Pairs every product with its recipe (undefined when none exists). */
export function buildRecipeEntries(
  products: Product[],
  recipes: Recipe[],
): RecipeEntry[] {
  const recipeByProductId = new Map(
    recipes.map((recipe) => [recipe.productId, recipe] as const),
  );

  return products.map((product) => ({
    product,
    recipe: recipeByProductId.get(product.id),
  }));
}

/** Applies the search text and category filter to a list of entries. */
export function filterRecipeEntries(
  entries: RecipeEntry[],
  filters: RecipeFilters,
): RecipeEntry[] {
  const query = filters.query.trim().toLowerCase();

  return entries.filter(({ product }) => {
    if (
      filters.categoryId !== "all" &&
      product.categoryId !== filters.categoryId
    ) {
      return false;
    }

    if (query && !product.name.toLowerCase().includes(query)) {
      return false;
    }

    return true;
  });
}

/** Finds the recipe for one size, or undefined if that size has none. */
export function getVariant(
  recipe: Recipe | undefined,
  size: ProductSize,
): RecipeVariant | undefined {
  return recipe?.variants.find((variant) => variant.size === size);
}

/** "220 ml", "1 pcs", and so on. */
export function formatIngredientAmount(ingredient: RecipeIngredient): string {
  return `${ingredient.amount} ${ingredient.unit}`;
}