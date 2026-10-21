import type { Order, OrderStatus } from "@/types/order";

export type StatusCounts = Record<OrderStatus, number>;

export type TopProduct = {
  productId: string;
  name: string;
  quantity: number;
};

export type DashboardStats = {
  /** The day these stats are for, as "YYYY-MM-DD" (shop time). Empty if no orders. */
  day: string;
  /** Total money from non-cancelled orders on that day. */
  salesToday: number;
  /** Number of non-cancelled orders on that day. */
  ordersToday: number;
  /** Orders still being worked on (pending, preparing, ready), across all days. */
  activeOrders: number;
  /** Average total of paid-for (non-complimentary, non-cancelled) orders on that day. */
  averageOrderValue: number;
  /** Count of orders per status, across all days. */
  statusCounts: StatusCounts;
  /** Best selling products across all non-cancelled orders. */
  topProducts: TopProduct[];
};

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "preparing", "ready"];

/** The shop is in Karachi (UTC+5, no daylight saving). */
const SHOP_UTC_OFFSET_MS = 5 * 60 * 60 * 1000;

/** "2026-10-15T19:30:00.000Z" -> "2026-10-16" (the day in shop time) */
function dayOf(isoDate: string): string {
  const shopTime = new Date(new Date(isoDate).getTime() + SHOP_UTC_OFFSET_MS);

  return shopTime.toISOString().slice(0, 10);
}

/** The day of the newest order. Used as "today" for the demo data. */
export function getReferenceDay(orders: Order[]): string {
  if (orders.length === 0) return "";

  const newest = orders.reduce(
    (latest, order) => (order.createdAt > latest ? order.createdAt : latest),
    orders[0].createdAt,
  );

  return dayOf(newest);
}

export function getDashboardStats(
  orders: Order[],
  topProductsLimit = 5,
): DashboardStats {
  const day = getReferenceDay(orders);

  const statusCounts: StatusCounts = {
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    statusCounts[order.status] += 1;
  }

  const activeOrders = ACTIVE_STATUSES.reduce(
    (sum, status) => sum + statusCounts[status],
    0,
  );

  const validOrders = orders.filter((order) => order.status !== "cancelled");
  const validOrdersToday = validOrders.filter(
    (order) => dayOf(order.createdAt) === day,
  );

  const salesToday = validOrdersToday.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const paidOrdersToday = validOrdersToday.filter(
    (order) => !order.isComplimentary,
  );
  const averageOrderValue =
    paidOrdersToday.length > 0 ? salesToday / paidOrdersToday.length : 0;

  const quantityByProduct = new Map<string, TopProduct>();

  for (const order of validOrders) {
    for (const orderItem of order.items) {
      const existing = quantityByProduct.get(orderItem.productId);

      if (existing) {
        existing.quantity += orderItem.quantity;
      } else {
        quantityByProduct.set(orderItem.productId, {
          productId: orderItem.productId,
          name: orderItem.name,
          quantity: orderItem.quantity,
        });
      }
    }
  }

  const topProducts = Array.from(quantityByProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, topProductsLimit);

  return {
    day,
    salesToday,
    ordersToday: validOrdersToday.length,
    activeOrders,
    averageOrderValue,
    statusCounts,
    topProducts,
  };
}
