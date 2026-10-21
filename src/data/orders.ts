import { products } from "@/data/menu";
import type { Order, OrderItem } from "@/types/order";

const MINUTE_MS = 60_000;
const SHOP_UTC_OFFSET_HOURS = 5; // Asia/Karachi is UTC+5, no daylight saving.

// Demo-only staff names for the proposed Order.createdBy field.
const ADMIN = "Demo Admin";
const CASHIER = "Demo Cashier";

/** Builds an order item from a product id, copying its name, price and category. */
function item(productId: string, quantity: number): OrderItem {
  const product = products.find((p) => p.id === productId);

  if (!product) {
    throw new Error(`Demo data error: unknown product id "${productId}"`);
  }

  return {
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity,
    categoryId: product.categoryId,
  };
}

/**
 * Calculates subtotal and total so they can never be typed wrongly.
 * Total = subtotal - discount + delivery fee (0 for complimentary orders).
 */
function buildOrder(input: Omit<Order, "subtotal" | "total">): Order {
  const subtotal = input.items.reduce(
    (sum, orderItem) => sum + orderItem.unitPrice * orderItem.quantity,
    0,
  );
  const discount = input.discount ?? 0;
  const deliveryFee = input.deliveryFee ?? 0;

  return {
    ...input,
    subtotal,
    total: input.isComplimentary
      ? 0
      : Math.max(subtotal - discount + deliveryFee, 0),
  };
}

/**
 * Demo orders with times worked out from "now", so the dashboard, kitchen
 * and orders pages always look fresh. All phone numbers below are fake.
 * Newest first.
 */
export function createDemoOrders(now: Date = new Date()): Order[] {
  // Today's date as seen in the shop (Karachi).
  const shopNow = new Date(
    now.getTime() + SHOP_UTC_OFFSET_HOURS * 60 * MINUTE_MS,
  );
  const year = shopNow.getUTCFullYear();
  const month = shopNow.getUTCMonth();
  const day = shopNow.getUTCDate();
  const minutesSinceMidnight =
    shopNow.getUTCHours() * 60 + shopNow.getUTCMinutes();

  // Today's orders reach back at most this many minutes.
  const LONGEST_GAP = 213;
  // Just after midnight, squeeze the gaps so today's orders stay today.
  const scale = Math.min(
    1,
    Math.max(minutesSinceMidnight - 1, 0) / LONGEST_GAP,
  );

  /** A time "this many minutes before now" (squeezed if needed). */
  function minutesAgo(minutes: number): string {
    const squeezed = Math.round(minutes * scale);

    return new Date(now.getTime() - squeezed * MINUTE_MS).toISOString();
  }

  /** A shop clock time (Karachi) on a day some days before today. */
  function daysAgo(days: number, hour: number, minute: number): string {
    return new Date(
      Date.UTC(year, month, day - days, hour - SHOP_UTC_OFFSET_HOURS, minute),
    ).toISOString();
  }

  return [
    buildOrder({
      id: "ord-1012",
      orderNumber: "ITH-1012",
      customerName: "Hassan Ali",
      type: "dine-in",
      status: "pending",
      paymentMethod: "cash",
      paymentStatus: "unpaid",
      items: [item("prod-lemon-tea", 2), item("prod-fries", 1)],
      isComplimentary: false,
      createdBy: CASHIER,
      createdAt: minutesAgo(8),
    }),
    buildOrder({
      id: "ord-1011",
      orderNumber: "ITH-1011",
      customerName: "Ayesha Khan",
      customerPhone: "0300-0000011",
      type: "delivery",
      status: "preparing",
      paymentMethod: "online",
      paymentStatus: "paid",
      items: [item("prod-strawberry-tea", 1), item("prod-sandwich", 1)],
      isComplimentary: false,
      deliveryFee: 150,
      createdBy: ADMIN,
      notes: "Less ice please.",
      createdAt: minutesAgo(38),
    }),
    buildOrder({
      id: "ord-1010",
      orderNumber: "ITH-1010",
      customerName: "Walk-in customer",
      type: "takeaway",
      status: "ready",
      paymentMethod: "card",
      paymentStatus: "paid",
      items: [item("prod-house-blend", 2), item("prod-brownie", 1)],
      isComplimentary: false,
      createdBy: CASHIER,
      createdAt: minutesAgo(73),
    }),
    buildOrder({
      id: "ord-1009",
      orderNumber: "ITH-1009",
      customerName: "Bilal Ahmed",
      type: "dine-in",
      status: "completed",
      paymentMethod: "cash",
      paymentStatus: "paid",
      items: [
        item("prod-peach-tea", 1),
        item("prod-cookie", 2),
        item("prod-lemonade", 1),
      ],
      isComplimentary: false,
      discount: 100,
      createdBy: CASHIER,
      createdAt: minutesAgo(118),
    }),
    buildOrder({
      id: "ord-1008",
      orderNumber: "ITH-1008",
      customerName: "Sara Malik",
      customerPhone: "0300-0000008",
      type: "delivery",
      status: "completed",
      paymentMethod: "online",
      paymentStatus: "paid",
      items: [item("prod-mango-tea", 2), item("prod-fries", 1)],
      isComplimentary: false,
      deliveryFee: 150,
      createdBy: ADMIN,
      createdAt: minutesAgo(168),
    }),
    buildOrder({
      id: "ord-1007",
      orderNumber: "ITH-1007",
      customerName: "Staff tasting",
      type: "dine-in",
      status: "completed",
      paymentMethod: "cash",
      paymentStatus: "paid",
      items: [item("prod-house-blend", 1), item("prod-matcha-cooler", 1)],
      isComplimentary: true,
      createdBy: ADMIN,
      notes: "Complimentary tasting for new recipe.",
      createdAt: minutesAgo(213),
    }),
    buildOrder({
      id: "ord-1006",
      orderNumber: "ITH-1006",
      customerName: "Usman Raza",
      type: "takeaway",
      status: "completed",
      paymentMethod: "card",
      paymentStatus: "paid",
      items: [item("prod-mint-tea", 3)],
      isComplimentary: false,
      createdBy: CASHIER,
      createdAt: daysAgo(1, 22, 20),
    }),
    buildOrder({
      id: "ord-1005",
      orderNumber: "ITH-1005",
      customerName: "Fatima Noor",
      type: "dine-in",
      status: "cancelled",
      paymentMethod: "cash",
      paymentStatus: "unpaid",
      items: [item("prod-hibiscus", 1)],
      isComplimentary: false,
      createdBy: CASHIER,
      notes: "Customer left before the order was served.",
      createdAt: daysAgo(1, 20, 5),
    }),
    buildOrder({
      id: "ord-1004",
      orderNumber: "ITH-1004",
      customerName: "Zain Abbas",
      customerPhone: "0300-0000004",
      type: "delivery",
      status: "completed",
      paymentMethod: "cash",
      paymentStatus: "paid",
      items: [item("prod-sandwich", 2), item("prod-lemonade", 2)],
      isComplimentary: false,
      deliveryFee: 150,
      createdBy: ADMIN,
      createdAt: daysAgo(1, 18, 10),
    }),
    buildOrder({
      id: "ord-1003",
      orderNumber: "ITH-1003",
      customerName: "Hira Sheikh",
      type: "dine-in",
      status: "completed",
      paymentMethod: "card",
      paymentStatus: "paid",
      items: [
        item("prod-matcha-cooler", 1),
        item("prod-watermelon", 1),
        item("prod-brownie", 1),
      ],
      isComplimentary: false,
      discount: 150,
      createdBy: CASHIER,
      createdAt: daysAgo(2, 23, 45),
    }),
    buildOrder({
      id: "ord-1002",
      orderNumber: "ITH-1002",
      customerName: "Walk-in customer",
      type: "takeaway",
      status: "completed",
      paymentMethod: "cash",
      paymentStatus: "paid",
      items: [item("prod-lemon-tea", 1), item("prod-peach-tea", 1)],
      isComplimentary: false,
      createdBy: ADMIN,
      createdAt: daysAgo(2, 21, 0),
    }),
    buildOrder({
      id: "ord-1001",
      orderNumber: "ITH-1001",
      customerName: "Imran Qureshi",
      customerPhone: "0300-0000001",
      type: "delivery",
      status: "cancelled",
      paymentMethod: "online",
      paymentStatus: "refunded",
      items: [item("prod-strawberry-tea", 2)],
      isComplimentary: false,
      createdBy: ADMIN,
      notes: "Delivery address was outside the service area.",
      createdAt: daysAgo(2, 17, 25),
    }),
  ];
}