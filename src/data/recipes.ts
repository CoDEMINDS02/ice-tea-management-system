import type { ProductSize } from "@/types/menu";
import type { IngredientUnit, Recipe, RecipeIngredient } from "@/types/recipe";

// DEMO DATA ONLY: amounts and steps are placeholders, not real recipes.

/** One ingredient row: [name, amount, unit]. */
type IngredientRow = [name: string, amount: number, unit: IngredientUnit];

type RecipeConfig = {
  id: string;
  productId: string;
  steps: string[];
  /** Ingredient rows for each size this product is made in. */
  sizes: Partial<Record<ProductSize, IngredientRow[]>>;
  notes?: string;
};

const SIZE_ORDER: ProductSize[] = ["small", "medium", "large"];
const UPDATED_AT = "2026-10-20T09:00:00.000Z";

function buildRecipe(config: RecipeConfig): Recipe {
  const variants: Recipe["variants"] = [];

  for (const size of SIZE_ORDER) {
    const rows = config.sizes[size];
    if (!rows) continue;

    const ingredients: RecipeIngredient[] = rows.map(
      ([name, amount, unit], index) => ({
        id: `${config.id}-${size}-${index + 1}`,
        name,
        amount,
        unit,
      }),
    );

    variants.push({ size, ingredients, steps: config.steps });
  }

  return {
    id: config.id,
    productId: config.productId,
    variants,
    ...(config.notes ? { notes: config.notes } : {}),
    updatedAt: UPDATED_AT,
  };
}

export const recipes: Recipe[] = [
  buildRecipe({
    id: "rec-lemon-tea",
    productId: "prod-lemon-tea",
    steps: [
      "Fill the cup with ice.",
      "Pour in the black tea base.",
      "Add the lemon juice and sugar syrup.",
      "Stir well and garnish with a lemon slice.",
    ],
    sizes: {
      small: [
        ["Black tea base", 150, "ml"],
        ["Lemon juice", 20, "ml"],
        ["Sugar syrup", 15, "ml"],
        ["Ice", 100, "g"],
        ["Lemon slice", 1, "pcs"],
      ],
      medium: [
        ["Black tea base", 220, "ml"],
        ["Lemon juice", 30, "ml"],
        ["Sugar syrup", 20, "ml"],
        ["Ice", 150, "g"],
        ["Lemon slice", 1, "pcs"],
      ],
      large: [
        ["Black tea base", 300, "ml"],
        ["Lemon juice", 40, "ml"],
        ["Sugar syrup", 30, "ml"],
        ["Ice", 200, "g"],
        ["Lemon slice", 2, "pcs"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-peach-tea",
    productId: "prod-peach-tea",
    steps: [
      "Fill the cup with ice.",
      "Pour in the black tea base.",
      "Add the peach syrup and stir well.",
    ],
    sizes: {
      small: [
        ["Black tea base", 150, "ml"],
        ["Peach syrup", 25, "ml"],
        ["Ice", 100, "g"],
      ],
      medium: [
        ["Black tea base", 220, "ml"],
        ["Peach syrup", 35, "ml"],
        ["Ice", 150, "g"],
      ],
      large: [
        ["Black tea base", 300, "ml"],
        ["Peach syrup", 45, "ml"],
        ["Ice", 200, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-mint-tea",
    productId: "prod-mint-tea",
    steps: [
      "Gently muddle the mint leaves with the sugar syrup in the cup.",
      "Fill the cup with ice.",
      "Pour in the black tea base and stir well.",
    ],
    sizes: {
      small: [
        ["Black tea base", 150, "ml"],
        ["Fresh mint leaves", 6, "pcs"],
        ["Sugar syrup", 15, "ml"],
        ["Ice", 100, "g"],
      ],
      medium: [
        ["Black tea base", 220, "ml"],
        ["Fresh mint leaves", 8, "pcs"],
        ["Sugar syrup", 20, "ml"],
        ["Ice", 150, "g"],
      ],
      large: [
        ["Black tea base", 300, "ml"],
        ["Fresh mint leaves", 10, "pcs"],
        ["Sugar syrup", 30, "ml"],
        ["Ice", 200, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-strawberry-tea",
    productId: "prod-strawberry-tea",
    steps: [
      "Add the strawberry puree and sugar syrup to the cup.",
      "Fill the cup with ice.",
      "Pour in the chilled tea base and stir well.",
    ],
    sizes: {
      medium: [
        ["Strawberry puree", 40, "ml"],
        ["Chilled tea base", 180, "ml"],
        ["Sugar syrup", 10, "ml"],
        ["Ice", 120, "g"],
      ],
      large: [
        ["Strawberry puree", 60, "ml"],
        ["Chilled tea base", 260, "ml"],
        ["Sugar syrup", 15, "ml"],
        ["Ice", 180, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-mango-tea",
    productId: "prod-mango-tea",
    steps: [
      "Add the mango pulp to the cup.",
      "Fill the cup with ice.",
      "Pour in the green tea base and stir well.",
    ],
    sizes: {
      medium: [
        ["Mango pulp", 50, "ml"],
        ["Green tea base", 180, "ml"],
        ["Ice", 120, "g"],
      ],
      large: [
        ["Mango pulp", 70, "ml"],
        ["Green tea base", 260, "ml"],
        ["Ice", 180, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-passion-tea",
    productId: "prod-passion-tea",
    steps: [
      "Add the passion fruit pulp and sugar syrup to the cup.",
      "Fill the cup with ice.",
      "Pour in the green tea base and stir well.",
    ],
    sizes: {
      medium: [
        ["Passion fruit pulp", 40, "ml"],
        ["Green tea base", 180, "ml"],
        ["Sugar syrup", 15, "ml"],
        ["Ice", 120, "g"],
      ],
      large: [
        ["Passion fruit pulp", 60, "ml"],
        ["Green tea base", 260, "ml"],
        ["Sugar syrup", 20, "ml"],
        ["Ice", 180, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-house-blend",
    productId: "prod-house-blend",
    notes: "Demo placeholder: replace with the real house recipe.",
    steps: [
      "Fill the cup with ice.",
      "Pour in the house blend tea base.",
      "Add the syrup and stir well.",
    ],
    sizes: {
      medium: [
        ["House blend tea base", 200, "ml"],
        ["Sugar syrup", 20, "ml"],
        ["Ice", 150, "g"],
      ],
      large: [
        ["House blend tea base", 280, "ml"],
        ["Sugar syrup", 30, "ml"],
        ["Ice", 200, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-hibiscus",
    productId: "prod-hibiscus",
    steps: [
      "Fill the cup with ice.",
      "Pour in the hibiscus tea base.",
      "Add the sugar syrup and lemon juice, then stir well.",
    ],
    sizes: {
      medium: [
        ["Hibiscus tea base", 220, "ml"],
        ["Sugar syrup", 15, "ml"],
        ["Lemon juice", 10, "ml"],
        ["Ice", 150, "g"],
      ],
      large: [
        ["Hibiscus tea base", 300, "ml"],
        ["Sugar syrup", 20, "ml"],
        ["Lemon juice", 15, "ml"],
        ["Ice", 200, "g"],
      ],
    },
  }),
  buildRecipe({
    id: "rec-lemonade",
    productId: "prod-lemonade",
    steps: [
      "Squeeze the lemon juice into the cup.",
      "Add the sugar syrup and cold water.",
      "Fill the cup with ice and stir well.",
    ],
    sizes: {
      small: [
        ["Fresh lemon juice", 40, "ml"],
        ["Sugar syrup", 25, "ml"],
        ["Cold water", 150, "ml"],
        ["Ice", 100, "g"],
      ],
      medium: [
        ["Fresh lemon juice", 60, "ml"],
        ["Sugar syrup", 35, "ml"],
        ["Cold water", 220, "ml"],
        ["Ice", 150, "g"],
      ],
      large: [
        ["Fresh lemon juice", 80, "ml"],
        ["Sugar syrup", 45, "ml"],
        ["Cold water", 300, "ml"],
        ["Ice", 200, "g"],
      ],
    },
  }),
];