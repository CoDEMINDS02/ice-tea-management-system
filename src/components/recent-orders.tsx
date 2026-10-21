import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types/order";

type RecentOrdersProps = {
  orders: Order[];
  limit?: number;
};

const TYPE_LABELS: Record<Order["type"], string> = {
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

export function RecentOrders({ orders, limit = 5 }: RecentOrdersProps) {
  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-neutral-900">
          Recent orders
        </h3>
        <p className="text-sm text-neutral-500">Latest {recent.length}</p>
      </div>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Order</th>
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 text-right font-medium">Total</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recent.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4 font-medium text-neutral-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">
                    {order.customerName}
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">
                    {TYPE_LABELS[order.type]}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4 text-right text-neutral-900">
                    {formatCurrency(order.total)}
                    {order.isComplimentary ? (
                      <span className="block text-xs text-neutral-500">
                        Complimentary
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 whitespace-nowrap text-neutral-500">
                    {formatDateTime(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}