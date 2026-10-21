import type { Category, Product } from "@/types/menu";

export type CategoryInput = {
  name: string;
  description: string;
};

export type CategoryField = "name" | "description";

export type CategoryErrors = Partial<Record<CategoryField, string>>;

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 120;

/**
 * Checks the form data. Pass editingId when editing, so a category is not
 * reported as a duplicate of itself.
 */
export function validateCategory(
  input: CategoryInput,
  existing: Category[],
  editingId?: string,
): CategoryErrors {
  const errors: CategoryErrors = {};
  const name = input.name.trim();
  const description = input.description.trim();

  if (!name) {
    errors.name = "Category name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  } else {
    const isDuplicate = existing.some(
      (category) =>
        category.id !== editingId &&
        category.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      errors.name = "A category with this name already exists.";
    }
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`;
  }

  return errors;
}

/** "Hot Drinks!" -> "hot-drinks" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Makes an id like "cat-hot-drinks" that no other category already uses. */
export function makeCategoryId(name: string, existing: Category[]): string {
  const base = `cat-${slugify(name) || "category"}`;
  const taken = new Set(existing.map((category) => category.id));

  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;

  return `${base}-${counter}`;
}

/**
 * Builds a new Category from the form data.
 * Call validateCategory first. This function does not validate.
 */
export function buildCategory(
  input: CategoryInput,
  existing: Category[],
): Category {
  const name = input.name.trim();
  const description = input.description.trim();

  return {
    id: makeCategoryId(name, existing),
    name,
    ...(description ? { description } : {}),
    isActive: true,
  };
}

/** How many products belong to a category. */
export function countProducts(
  categoryId: string,
  products: Product[],
): number {
  return products.filter((product) => product.categoryId === categoryId)
    .length;
}