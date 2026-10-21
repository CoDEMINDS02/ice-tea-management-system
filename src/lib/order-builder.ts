import type {
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

export type NewOrderInput = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isComplimentary: boolean;
  notes: string;
  items: OrderItem[];
  /** Whole rupees typed in the form. Empty means no discount. */
  discount?: string;
  discountPercent?: string;
  /** Whole rupees typed in the form. Only used for delivery orders. */
  deliveryFee?: string;
  manualExtraCharge?: string;
  manualExtraDescription?: string;
  complimentaryRecipient?: string;
  complimentaryCampaign?: string;
  complimentaryApprovedBy?: string;
  /** Display name of the staff member who takes the order. */
  createdBy?: string;
};

export type NewOrderField =
  | "customerName"
  | "customerPhone"
  | "deliveryAddress"
  | "notes"
  | "items"
  | "discount"
  | "deliveryFee";

export type NewOrderErrors = Partial<Record<NewOrderField, string>>;

const MAX_NAME_LENGTH = 60;
const MAX_NOTES_LENGTH = 200;
/** Demo limit, so a typing mistake like 50000 is caught. */
const MAX_DELIVERY_FEE = 10000;

const WHOLE_AMOUNT_PATTERN = /^\d+$/;

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, orderItem) => sum + orderItem.unitPrice * orderItem.quantity,
    0,
  );
}

/** Total number of pieces in the cart, e.g. 2 lemon teas + 1 fries = 3. */
export function countPieces(items: OrderItem[]): number {
  return items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
}

function countDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

/** "" or undefined -> 0. Call only after the value has been validated. */
function parseAmount(value: string | undefined): number {
  const text = (value ?? "").trim();

  return text === "" ? 0 : Number(text);
}

/**
 * The discount and delivery fee that really apply to an order.
 * Complimentary orders have neither. Delivery fee is only for delivery orders.
 */
export function calculateAdjustments(
  input: Pick<
    NewOrderInput,
    | "type"
    | "isComplimentary"
    | "discount"
    | "discountPercent"
    | "deliveryFee"
    | "manualExtraCharge"
  >,
): { discount: number; deliveryFee: number; manualExtraCharge: number } {
  if (input.isComplimentary) {
    return { discount: 0, deliveryFee: 0, manualExtraCharge: 0 };
  }

  const subtotal = 0;

  return {
    discount: parseAmount(input.discount),
    deliveryFee: input.type === "delivery" ? parseAmount(input.deliveryFee) : 0,
    manualExtraCharge: parseAmount(input.manualExtraCharge),
  };
}

/** Demo total = subtotal - discount + deliveryFee, and 0 for complimentary. */
export function calculateTotal(
  items: OrderItem[],
  input: Pick<
    NewOrderInput,
    | "type"
    | "isComplimentary"
    | "discount"
    | "discountPercent"
    | "deliveryFee"
    | "manualExtraCharge"
  >,
): number {
  if (input.isComplimentary) return 0;

  const { discount, deliveryFee, manualExtraCharge } = calculateAdjustments(input);

  return calculateSubtotal(items) - discount + deliveryFee + manualExtraCharge;
}

export function validateNewOrder(input: NewOrderInput): NewOrderErrors {
  const errors: NewOrderErrors = {};
  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  const address = input.deliveryAddress.trim();
  const notes = input.notes.trim();

  if (!name) {
    errors.customerName = "Customer name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.customerName = `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  if (input.type === "delivery" && !phone) {
    errors.customerPhone = "Phone number is required for delivery orders.";
  } else if (phone) {
    const digits = countDigits(phone);
    const onlyAllowedChars = /^[0-9+\-\s()]+$/.test(phone);

    if (!onlyAllowedChars || digits < 7 || digits > 15) {
      errors.customerPhone = "Enter a valid phone number (7 to 15 digits).";
    }
  }

  if (input.type === "delivery" && !address) {
    errors.deliveryAddress = "Delivery address is required for delivery orders.";
  }

  if (input.isComplimentary && !notes) {
    errors.notes = "Please write the reason for a complimentary order.";
  } else if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or less.`;
  }

  if (input.items.length === 0) {
    errors.items = "Add at least one product to the order.";
  }

  // Complimentary orders ignore discount and delivery fee, so skip the checks.
  if (!input.isComplimentary) {
    const discountText = (input.discount ?? "").trim();

    if (discountText !== "") {
      if (!WHOLE_AMOUNT_PATTERN.test(discountText)) {
        errors.discount = "Enter a whole amount in rupees, e.g. 100.";
      } else if (Number(discountText) > calculateSubtotal(input.items)) {
        errors.discount = "Discount cannot be more than the subtotal.";
      }
    }

    const feeText = (input.deliveryFee ?? "").trim();

    if (input.type === "delivery" && feeText !== "") {
      if (!WHOLE_AMOUNT_PATTERN.test(feeText)) {
        errors.deliveryFee = "Enter a whole amount in rupees, e.g. 150.";
      } else if (Number(feeText) > MAX_DELIVERY_FEE) {
        errors.deliveryFee = `Delivery fee must be Rs ${MAX_DELIVERY_FEE} or less.`;
      }
    }
  }

  return errors;
}

/** Finds the highest number in "ITH-1012" style order numbers. */
function highestOrderNumber(orders: Order[]): number {
  return orders.reduce((highest, order) => {
    const match = /^ITH-(\d+)$/.exec(order.orderNumber);
    const value = match ? Number(match[1]) : 0;

    return value > highest ? value : highest;
  }, 1000);
}

/**
 * Builds a full Order from the form data.
 * Call validateNewOrder first. This function does not validate.
 */
export function buildNewOrder(
  input: NewOrderInput,
  existingOrders: Order[],
  now: Date = new Date(),
): Order {
  const nextNumber = highestOrderNumber(existingOrders) + 1;
  const subtotal = calculateSubtotal(input.items);
  const phone = input.customerPhone.trim();
  const notes = input.notes.trim();
  const createdBy = (input.createdBy ?? "").trim();
  const { discount, deliveryFee, manualExtraCharge } = calculateAdjustments(input);

  return {
    id: `ord-${nextNumber}`,
    orderNumber: `ITH-${nextNumber}`,
    customerName: input.customerName.trim(),
    ...(phone ? { customerPhone: phone } : {}),
    ...(input.deliveryAddress.trim() ? { deliveryAddress: input.deliveryAddress.trim() } : {}),
    ...(input.deliveryInstructions.trim()
      ? { deliveryInstructions: input.deliveryInstructions.trim() }
      : {}),
    type: input.type,
    status: "pending",
    paymentMethod: input.paymentMethod,
    paymentStatus: input.isComplimentary ? "paid" : input.paymentStatus,
    items: input.items,
    subtotal,
    total: calculateTotal(input.items, input),
    isComplimentary: input.isComplimentary,
    ...(notes ? { notes } : {}),
    createdAt: now.toISOString(),
    ...(discount > 0 ? { discount } : {}),
    ...(deliveryFee > 0 ? { deliveryFee } : {}),
    ...(manualExtraCharge > 0 ? { manualExtraCharge } : {}),
    ...(input.manualExtraDescription?.trim()
      ? { manualExtraDescription: input.manualExtraDescription.trim() }
      : {}),
    ...(input.discountPercent && Number(input.discountPercent) > 0
      ? { discountPercent: Number(input.discountPercent) }
      : {}),
    ...(input.complimentaryRecipient?.trim()
      ? { complimentaryRecipient: input.complimentaryRecipient.trim() }
      : {}),
    ...(input.complimentaryCampaign?.trim()
      ? { complimentaryCampaign: input.complimentaryCampaign.trim() }
      : {}),
    ...(input.complimentaryApprovedBy?.trim()
      ? { complimentaryApprovedBy: input.complimentaryApprovedBy.trim() }
      : {}),
    ...(createdBy ? { createdBy } : {}),
  };
}
