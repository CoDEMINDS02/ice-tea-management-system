import type { OrderType, PaymentMethod } from "@/types/order";

export const TYPE_LABELS: Record<OrderType, string> = {
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "bank-transfer": "Bank transfer",
  "mobile-wallet": "Mobile wallet",
  online: "Online",
};
