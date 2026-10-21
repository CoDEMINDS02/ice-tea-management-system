import type { ProductSize } from "@/types/menu";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderType = "dine-in" | "takeaway" | "delivery";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank-transfer"
  | "mobile-wallet"
  | "online";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "due-on-delivery"
  | "due-on-collection"
  | "refunded";

export type OrderItem = {
  productId: string;
  /** Product name at the time of the order, so old orders never change. */
  name: string;
  /** Price per unit at the time of the order. */
  unitPrice: number;
  quantity: number;
  size?: ProductSize;
  ice?: "extra" | "less" | "no";
  bobas?: "extra" | "less" | "no";
  instructions?: string;
  /**
   * PROPOSED (not agreed with backend yet): Category.id at the time of the
   * order, so a product moving category later does not change old reports.
   */
  categoryId?: string;
};

export type Order = {
  id: string;
  /** Short readable number shown to staff, e.g. "ITH-1001". */
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  isComplimentary: boolean;
  notes?: string;
  /** ISO date string, e.g. "2026-10-15T14:30:00.000Z". */
  createdAt: string;

  // PROPOSED fields (demo only, not agreed with backend yet). All optional,
  // so old saved orders keep working and count as 0 / unknown.
  /** Discount amount taken off the subtotal. */
  discount?: number;
  /** Delivery charge added to the order. */
  deliveryFee?: number;
  manualExtraCharge?: number;
  manualExtraDescription?: string;
  discountPercent?: number;
  complimentaryRecipient?: string;
  complimentaryCampaign?: string;
  complimentaryApprovedBy?: string;
  /** Staff member who took the order (display name for now). */
  createdBy?: string;
  /** Points to ShopEvent.id when the order belongs to an event. */
  eventId?: string;
};
