import type { TopProduct } from "@/lib/dashboard-stats";

type TopProductsProps = {
  products: TopProduct[];
};

export function TopProducts({ products }: TopProductsProps) {
  const maxQuantity = products.reduce(
    (max, product) => Math.max(max, product.quantity),
    0,
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-neutral-900">
          Top products
        </h3>
        <p className="text-sm text-neutral-500">By quantity sold</p>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No sales yet.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {products.map((product, index) => {
            const percent =
              maxQuantity > 0 ? (product.quantity / maxQuantity) * 100 : 0;

            return (
              <li key={product.productId}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3 text-neutral-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
                      {index + 1}
                    </span>
                    {product.name}
                  </span>
                  <span className="shrink-0 font-medium text-neutral-900">
                    {product.quantity} sold
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}