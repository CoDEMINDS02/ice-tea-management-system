export type Category = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export type ProductSize = "small" | "medium" | "large";

export type Product = {
  id: string;
  name: string;
  description?: string;
  /** Points to Category.id */
  categoryId: string;
  /** Price per unit. Same number type as Order amounts. */
  price: number;
  /** Hidden from new orders when false (e.g. out of stock or retired). */
  isAvailable: boolean;
  /** Sizes this product is sold in. Leave empty if it has a single size. */
  sizes?: ProductSize[];
};