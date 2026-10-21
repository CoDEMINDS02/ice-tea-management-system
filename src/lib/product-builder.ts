import type { Category, Product, ProductSize } from "@/types/menu";

export type ProductInput = {
  name: string;
  description: string;
  categoryId: string;
  /** Whole rupees typed in the form, e.g. "350". */
  price: string;
  sizes: ProductSize[];
};

/** What an edit may change. The id and availability are never touched here. */
export type ProductChanges = {
  name: string;
  /** Undefined removes the description. */
  description: string | undefined;
  categoryId: string;
  price: number;
  /** Undefined means the product has a single size. */
  sizes: ProductSize[] | undefined;
};

export type ProductField = "name" | "description" | "categoryId" | "price";

export type ProductErrors = Partial<Record<ProductField, string>>;

export const PRODUCT_SIZES: ProductSize[] = ["small", "medium", "large"];

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 120;
const MAX_PRICE = 100_000;
const WHOLE_AMOUNT_PATTERN = /^\d+$/;

/** Keeps only valid sizes, always in small, medium, large order. */
function normalizeSizes(sizes: ProductSize[]): ProductSize[] {
  return PRODUCT_SIZES.filter((size) => sizes.includes(size));
}

/**
 * Checks the form data. Pass editingId when editing, so a product is not
 * reported as a duplicate of itself.
 */
export function validateProduct(
  input: ProductInput,
  products: Product[],
  categories: Category[],
  editingId?: string,
): ProductErrors {
  const errors: ProductErrors = {};
  const name = input.name.trim();
  const description = input.description.trim();
  const priceText = input.price.trim();

  if (!name) {
    errors.name = "Product name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  } else {
    const isDuplicate = products.some(
      (product) =>
        product.id !== editingId &&
        product.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      errors.name = "A product with this name already exists.";
    }
  }

  if (!input.categoryId) {
    errors.categoryId = "Choose a category.";
  } else if (!categories.some((category) => category.id === input.categoryId)) {
    errors.categoryId = "This category no longer exists.";
  }

  if (!priceText) {
    errors.price = "Price is required.";
  } else if (!WHOLE_AMOUNT_PATTERN.test(priceText)) {
    errors.price = "Enter a whole amount in rupees, e.g. 350.";
  } else {
    const price = Number(priceText);

    if (price <= 0) {
      errors.price = "Price must be more than Rs 0.";
    } else if (price > MAX_PRICE) {
      errors.price = `Price must be Rs ${MAX_PRICE.toLocaleString("en-US")} or less.`;
    }
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`;
  }

  return errors;
}

/** "Hot Latte!" -> "hot-latte" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Makes an id like "prod-hot-latte" that no other product already uses. */
export function makeProductId(name: string, existing: Product[]): string {
  const base = `prod-${slugify(name) || "product"}`;
  const taken = new Set(existing.map((product) => product.id));

  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;

  return `${base}-${counter}`;
}

/**
 * Builds a new Product from the form data.
 * Call validateProduct first. This function does not validate.
 */
export function buildProduct(
  input: ProductInput,
  existing: Product[],
): Product {
  const name = input.name.trim();
  const description = input.description.trim();
  const sizes = normalizeSizes(input.sizes);

  return {
    id: makeProductId(name, existing),
    name,
    ...(description ? { description } : {}),
    categoryId: input.categoryId,
    price: Number(input.price.trim()),
    isAvailable: true,
    ...(sizes.length > 0 ? { sizes } : {}),
  };
}

/** Turns form data into the changes for an existing product. */
export function toProductChanges(input: ProductInput): ProductChanges {
  const description = input.description.trim();
  const sizes = normalizeSizes(input.sizes);

  return {
    name: input.name.trim(),
    description: description || undefined,
    categoryId: input.categoryId,
    price: Number(input.price.trim()),
    sizes: sizes.length > 0 ? sizes : undefined,
  };
}

/** Fills the edit form with a product's current values. */
export function productToInput(product: Product): ProductInput {
  return {
    name: product.name,
    description: product.description ?? "",
    categoryId: product.categoryId,
    price: String(product.price),
    sizes: product.sizes ?? [],
  };
}