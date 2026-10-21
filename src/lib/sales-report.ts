import type { Order, OrderType, PaymentMethod } from "@/types/order";

export type SalesPeriod = "today" | "7d" | "30d" | "year" | "all" | "custom";

/** A custom report range, as "YYYY-MM-DD" shop days. */
export type CustomRange = {
  from: string;
  to: string;
};

/** Longest custom range allowed, so the daily chart stays readable. */
export const MAX_CUSTOM_DAYS = 366;

export type DailySales = {
  /** Shop day as "YYYY-MM-DD". */
  day: string;
  sales: number;
  orders: number;
};

export type GroupTotals = {
  sales: number;
  orders: number;
};

export type ProductSales = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type StaffSales = {
  /** Staff member name, or "Not recorded" when the order has no createdBy. */
  name: string;
  sales: number;
  orders: number;
};

export type SalesReport = {
  period: SalesPeriod;
  /** First and last shop day of the report, "YYYY-MM-DD". */
  fromDay: string;
  toDay: string;
  /** Total of orders that are not cancelled, complimentary or refunded. */
  sales: number;
  /** Number of orders counted in sales. */
  orderCount: number;
  averageOrderValue: number;
  /** Part of sales that has not been paid yet (e.g. cash on delivery). */
  unpaid: number;
  /** Money given back. These orders are already left out of sales. */
  refunded: number;
  cancelledCount: number;
  complimentaryCount: number;
  /** Menu price of complimentary orders (what was given away). */
  complimentaryValue: number;
  /** Discounts on counted sales. Already taken off sales. */
  discounts: number;
  /** Delivery fees on counted sales. Already included in sales. */
  deliveryFees: number;
  /** One entry per day from fromDay to toDay, with zeros for quiet days. */
  daily: DailySales[];
  byPaymentMethod: Record<PaymentMethod, GroupTotals>;
  byOrderType: Record<OrderType, GroupTotals>;
  /** Sales per staff member, highest first. */
  byStaff: StaffSales[];
  topProducts: ProductSales[];
  /** Every product sold in the period, best sellers first. */
  soldProducts: ProductSales[];
};

const SHOP_UTC_OFFSET_HOURS = 5; // Asia/Karachi is UTC+5, no daylight saving.
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "card",
  "bank-transfer",
  "mobile-wallet",
  "online",
];
const ORDER_TYPES: OrderType[] = ["dine-in", "takeaway", "delivery"];

/** Label for orders that have no createdBy value. */
const NO_STAFF_LABEL = "Not recorded";

/**
 * The shop day (Karachi) of a moment, as "YYYY-MM-DD".
 * Returns "" if the date is not valid.
 */
export function shopDayOf(value: string | Date): string {
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();

  if (Number.isNaN(time)) return "";

  return new Date(time + SHOP_UTC_OFFSET_HOURS * HOUR_MS)
    .toISOString()
    .slice(0, 10);
}

/** "2026-10-20", -6 -> "2026-10-14" */
function shiftDay(day: string, delta: number): string {
  return new Date(Date.parse(`${day}T00:00:00.000Z`) + delta * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** Every day from "from" to "to", both included. */
function listDays(from: string, to: string): string[] {
  const days: string[] = [];

  for (let day = from; day <= to; day = shiftDay(day, 1)) {
    days.push(day);
  }

  return days;
}

function emptyTotals<K extends string>(keys: K[]): Record<K, GroupTotals> {
  const totals = {} as Record<K, GroupTotals>;

  for (const key of keys) {
    totals[key] = { sales: 0, orders: 0 };
  }

  return totals;
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns a message to show the user, or null when the range is usable. */
export function validateCustomRange(range: CustomRange): string | null {
  if (!DAY_PATTERN.test(range.from) || !DAY_PATTERN.test(range.to)) {
    return "Choose a start and an end date.";
  }

  const from = Date.parse(`${range.from}T00:00:00.000Z`);
  const to = Date.parse(`${range.to}T00:00:00.000Z`);

  if (Number.isNaN(from) || Number.isNaN(to)) {
    return "Choose a start and an end date.";
  }

  if (from > to) {
    return "The start date must be on or before the end date.";
  }

  if ((to - from) / DAY_MS + 1 > MAX_CUSTOM_DAYS) {
    return `Choose a range of at most ${MAX_CUSTOM_DAYS} days.`;
  }

  return null;
}

export function buildSalesReport(
  orders: Order[],
  period: SalesPeriod,
  now: Date = new Date(),
  customRange?: CustomRange,
): SalesReport {
  const today = shopDayOf(now);

  // Orders with a readable date, each with its shop day.
  const datedOrders = orders
    .map((order) => ({ order, day: shopDayOf(order.createdAt) }))
    .filter((entry) => entry.day !== "");

  const orderDays = datedOrders.map((entry) => entry.day).sort();

  let fromDay: string;
  let toDay: string;

  switch (period) {
    case "today":
      fromDay = today;
      toDay = today;
      break;
    case "7d":
      fromDay = shiftDay(today, -6);
      toDay = today;
      break;
    case "30d":
      fromDay = shiftDay(today, -29);
      toDay = today;
      break;
    case "year":
      fromDay = `${today.slice(0, 4)}-01-01`;
      toDay = today;
      break;
    case "custom":
      if (customRange && validateCustomRange(customRange) === null) {
        fromDay = customRange.from;
        toDay = customRange.to;
      } else {
        // Incomplete or invalid range: show today until a valid one is chosen.
        fromDay = today;
        toDay = today;
      }
      break;
    default: {
      const first = orderDays[0];
      const last = orderDays[orderDays.length - 1];

      fromDay = first && first < today ? first : today;
      toDay = last && last > today ? last : today;
    }
  }

  const inRange = datedOrders.filter(
    (entry) => entry.day >= fromDay && entry.day <= toDay,
  );

  let sales = 0;
  let orderCount = 0;
  let unpaid = 0;
  let refunded = 0;
  let cancelledCount = 0;
  let complimentaryCount = 0;
  let complimentaryValue = 0;
  let discounts = 0;
  let deliveryFees = 0;

  const dailyMap = new Map<string, DailySales>();
  const byPaymentMethod = emptyTotals(PAYMENT_METHODS);
  const byOrderType = emptyTotals(ORDER_TYPES);
  const productMap = new Map<string, ProductSales>();
  const staffMap = new Map<string, StaffSales>();

  for (const { order, day } of inRange) {
    const cancelled = order.status === "cancelled";

    if (cancelled) cancelledCount += 1;

    if (order.isComplimentary) {
      if (!cancelled) {
        complimentaryCount += 1;
        complimentaryValue += order.subtotal;
      }
      continue;
    }

    if (order.paymentStatus === "refunded") {
      refunded += order.total;
      continue;
    }

    if (cancelled) continue;

    // From here on it is a real sale.
    sales += order.total;
    orderCount += 1;
    discounts += order.discount ?? 0;
    deliveryFees += order.deliveryFee ?? 0;

    if (
      order.paymentStatus === "unpaid" ||
      order.paymentStatus === "due-on-delivery" ||
      order.paymentStatus === "due-on-collection"
    )
      unpaid += order.total;

    const dayTotals = dailyMap.get(day) ?? { day, sales: 0, orders: 0 };
    dayTotals.sales += order.total;
    dayTotals.orders += 1;
    dailyMap.set(day, dayTotals);

    byPaymentMethod[order.paymentMethod].sales += order.total;
    byPaymentMethod[order.paymentMethod].orders += 1;
    byOrderType[order.type].sales += order.total;
    byOrderType[order.type].orders += 1;

    const staffName = order.createdBy?.trim() || NO_STAFF_LABEL;
    const staffTotals = staffMap.get(staffName) ?? {
      name: staffName,
      sales: 0,
      orders: 0,
    };
    staffTotals.sales += order.total;
    staffTotals.orders += 1;
    staffMap.set(staffName, staffTotals);

    for (const item of order.items) {
      const existing = productMap.get(item.productId);
      const revenue = item.unitPrice * item.quantity;

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          revenue,
        });
      }
    }
  }

  const daily = listDays(fromDay, toDay).map(
    (day) => dailyMap.get(day) ?? { day, sales: 0, orders: 0 },
  );

  const soldProducts = Array.from(productMap.values()).sort(
    (a, b) => b.quantity - a.quantity || b.revenue - a.revenue,
  );
  const topProducts = soldProducts.slice(0, 5);

  const byStaff = Array.from(staffMap.values()).sort(
    (a, b) => b.sales - a.sales || b.orders - a.orders,
  );

  return {
    period,
    fromDay,
    toDay,
    sales,
    orderCount,
    averageOrderValue: orderCount > 0 ? sales / orderCount : 0,
    unpaid,
    refunded,
    cancelledCount,
    complimentaryCount,
    complimentaryValue,
    discounts,
    deliveryFees,
    daily,
    byPaymentMethod,
    byOrderType,
    byStaff,
    topProducts,
    soldProducts,
  };
}
