import type { ProductSize } from "@/types/menu";

/** Fixed measurement units for recipe ingredients. */
export type IngredientUnit = "ml" | "g" | "kg" | "pcs" | "tsp";

export type RecipeIngredient = {
  id: string;
  name: string;
  /** Amount to use. Display only: Version 1 has no stock control. */
  amount: number;
  unit: IngredientUnit;
};

/** The recipe for one size of a product (e.g. the Large version). */
export type RecipeVariant = {
  size: ProductSize;
  ingredients: RecipeIngredient[];
  /** Preparation steps, in order. */
  steps: string[];
};

export type Recipe = {
  id: string;
  /** Points to Product.id */
  productId: string;
  /** One entry per size this product is made in. */
  variants: RecipeVariant[];
  /** Optional note shown to kitchen staff, e.g. "Use chilled tea base". */
  notes?: string;
  /** ISO date string, e.g. "2026-10-20T10:00:00.000Z" */
  updatedAt: string;
};