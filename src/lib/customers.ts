import type { Order } from "@/types/order";

export type Customer = {
  /** Stable key: "phone:<digits>" if a phone is known, otherwise "name:<lowercase name>". */
  id: string;
  name: string;
  phone?: string;
  /** Orders that were not cancelled. */
  orderCount: number;
  cancelledCount: number;
  /** Total of all non-cancelled orders. */
  totalSpent: number;
  /** ISO date of the newest order, whatever its status. */
  lastOrderAt: string;
};

export type CustomerSort = "recent" | "spent" | "orders" | "name";

const WALK_IN_NAME = "walk-in customer";

function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/** Which customer an order belongs to. Null means "not a trackable customer". */
function customerKey(order: Order): string | null {
  const digits = digitsOf(order.customerPhone ?? "");

  if (digits) return `phone:${digits}`;

  const name = order.customerName.trim().toLowerCase();

  if (!name || name === WALK_IN_NAME) return null;

  return `name:${name}`;
}

/** Builds the customer list from orders. Complimentary orders are ignored. */
export function buildCustomers(orders: Order[]): Customer[] {
  const customers = new Map<string, Customer>();

  for (const order of orders) {
    if (order.isComplimentary) continue;

    const key = customerKey(order);
    if (!key) continue;

    const cancelled = order.status === "cancelled";
    const phone = order.customerPhone?.trim();
    const existing = customers.get(key);

    if (!existing) {
      customers.set(key, {
        id: key,
        name: order.customerName.trim(),
        ...(phone ? { phone } : {}),
        orderCount: cancelled ? 0 : 1,
        cancelledCount: cancelled ? 1 : 0,
        totalSpent: cancelled ? 0 : order.total,
        lastOrderAt: order.createdAt,
      });
      continue;
    }

    if (cancelled) {
      existing.cancelledCount += 1;
    } else {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
    }

    // The newest order decides which name and phone are shown.
    if (order.createdAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.createdAt;
      existing.name = order.customerName.trim();
      if (phone) existing.phone = phone;
    }
  }

  return Array.from(customers.values());
}

/** True if the name or phone contains the search text. */
export function matchesCustomerSearch(
  customer: Customer,
  query: string,
): boolean {
  if (!query) return true;

  const text = query.toLowerCase();
  const digits = digitsOf(text);

  if (customer.name.toLowerCase().includes(text)) return true;

  if (customer.phone) {
    if (customer.phone.toLowerCase().includes(text)) return true;
    if (digits && digitsOf(customer.phone).includes(digits)) return true;
  }

  return false;
}

/** Returns a sorted copy. The original list is not changed. */
export function sortCustomers(
  customers: Customer[],
  sortBy: CustomerSort,
): Customer[] {
  const sorted = [...customers];

  switch (sortBy) {
    case "spent":
      return sorted.sort(
        (a, b) => b.totalSpent - a.totalSpent || a.name.localeCompare(b.name),
      );
    case "orders":
      return sorted.sort(
        (a, b) => b.orderCount - a.orderCount || a.name.localeCompare(b.name),
      );
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
  }
}