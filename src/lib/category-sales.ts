import type { ProductSales } from "@/lib/sales-report";
import type { Category, Product } from "@/types/menu";

export type CategorySales = {
  /** Category.id, or "unknown" for products no longer in the catalog. */
  categoryId: string;
  name: string;
  quantity: number;
  revenue: number;
};

const UNKNOWN_CATEGORY_ID = "unknown";
const UNKNOWN_CATEGORY_NAME = "Other (not in catalog)";

/**
 * Totals sold items per menu category, highest revenue first.
 *
 * Orders only store a productId, so each product is matched to its CURRENT
 * category. If a product is moved to another category later, its past sales
 * move with it. Products missing from the catalog go under "Other".
 */
export function buildCategorySales(
  soldProducts: ProductSales[],
  products: Product[],
  categories: Category[],
): CategorySales[] {
  const categoryByProductId = new Map(
    products.map((product) => [product.id, product.categoryId] as const),
  );
  const nameByCategoryId = new Map(
    categories.map((category) => [category.id, category.name] as const),
  );

  const totals = new Map<string, CategorySales>();

  for (const sold of soldProducts) {
    const productCategoryId = categoryByProductId.get(sold.productId);
    const known =
      productCategoryId !== undefined &&
      nameByCategoryId.has(productCategoryId);

    const categoryId = known ? productCategoryId : UNKNOWN_CATEGORY_ID;
    const name = known
      ? (nameByCategoryId.get(productCategoryId) ?? UNKNOWN_CATEGORY_NAME)
      : UNKNOWN_CATEGORY_NAME;

    const entry = totals.get(categoryId) ?? {
      categoryId,
      name,
      quantity: 0,
      revenue: 0,
    };

    entry.quantity += sold.quantity;
    entry.revenue += sold.revenue;
    totals.set(categoryId, entry);
  }

  return Array.from(totals.values()).sort(
    (a, b) => b.revenue - a.revenue || b.quantity - a.quantity,
  );
}