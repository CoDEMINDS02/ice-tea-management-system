"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { useCatalog } from "@/components/catalog/catalog-provider";
import { AUDIT_ACTOR } from "@/lib/audit-log";
import { formatCurrency } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import {
  buildNewOrder,
  calculateAdjustments,
  calculateSubtotal,
  calculateTotal,
  countPieces,
  validateNewOrder,
  type NewOrderErrors,
} from "@/lib/order-builder";
import { useOrders } from "@/components/orders/orders-provider";
import type {
  OrderItem,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";
import type { Product } from "@/types/menu";

const ORDER_TYPES = Object.keys(TYPE_LABELS) as OrderType[];
const PAYMENT_METHODS = Object.keys(METHOD_LABELS) as PaymentMethod[];

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

/** Keeps the live total safe while the user is still typing: bad text counts as 0. */
function cleanAmount(value: string): string {
  const text = value.trim();

  return /^\d+$/.test(text) ? text : "";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export function NewOrderForm() {
  const router = useRouter();
  const { orders, addOrder } = useOrders();
  const { categories, products } = useCatalog();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [type, setType] = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [isComplimentary, setIsComplimentary] = useState(false);
  const [discount, setDiscount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [manualExtraCharge, setManualExtraCharge] = useState("");
  const [manualExtraDescription, setManualExtraDescription] = useState("");
  const [complimentaryRecipient, setComplimentaryRecipient] = useState("");
  const [complimentaryCampaign, setComplimentaryCampaign] = useState("");
  const [complimentaryApprovedBy, setComplimentaryApprovedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<NewOrderErrors>({});

  const subtotal = calculateSubtotal(items);
  const pieces = countPieces(items);

  // Values used only for the live summary (invalid text counts as 0).
  const liveAmounts = {
    type,
    isComplimentary,
    discount: cleanAmount(discount),
    deliveryFee: cleanAmount(deliveryFee),
    manualExtraCharge: cleanAmount(manualExtraCharge),
  };
  const adjustments = calculateAdjustments(liveAmounts);
  const total = Math.max(0, calculateTotal(items, liveAmounts));

  const showDiscount = !isComplimentary;
  const showDeliveryFee = !isComplimentary && type === "delivery";

  // Active categories that still have at least one product.
  const groups = useMemo(
    () =>
      categories
        .filter((category) => category.isActive)
        .map((category) => ({
          category,
          products: products.filter(
            (product) => product.categoryId === category.id,
          ),
        }))
        .filter((group) => group.products.length > 0),
    [categories, products],
  );

  function addProduct(product: Product) {
    setItems((current) => {
      const existing = current.find((i) => i.productId === product.id);

      if (existing) {
        return current.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          categoryId: product.categoryId,
        },
      ];
    });
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function changeQuantity(productId: string, delta: number) {
    setItems((current) =>
      current
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function removeItem(productId: string) {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }

  function updateItem(
    productId: string,
    changes: Partial<Pick<OrderItem, "ice" | "bobas" | "instructions">>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, ...changes } : item,
      ),
    );
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryInstructions,
      type,
      paymentMethod,
      paymentStatus,
      isComplimentary,
      notes,
      items,
      discount,
      deliveryFee,
      manualExtraCharge,
      manualExtraDescription,
      complimentaryRecipient,
      complimentaryCampaign,
      complimentaryApprovedBy,
      createdBy: AUDIT_ACTOR,
    };

    const foundErrors = validateNewOrder(input);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    addOrder(buildNewOrder(input, orders));
    router.push("/orders");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_24rem]"
    >
      {/* Left: product picker */}
      <section aria-labelledby="products-heading" className="space-y-6">
        <h3 id="products-heading" className="sr-only">
          Choose products
        </h3>

        {groups.map(({ category, products: categoryProducts }) => (
          <div key={category.id}>
            <h4 className="mb-2 text-sm font-semibold text-neutral-900">
              {category.name}
            </h4>
            <ul className="grid gap-3 sm:grid-cols-2">
              {categoryProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {product.isAvailable ? (
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      aria-label={`Add ${product.name} to order`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                      Unavailable
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Right: cart and customer details */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart
              className="h-4 w-4 text-neutral-500"
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-neutral-900">
              Order items ({pieces})
            </h3>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg bg-neutral-50 px-3 py-6 text-center text-sm text-neutral-500">
              No products added yet.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {items.map((orderItem) => (
                <li key={orderItem.productId} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {orderItem.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(orderItem.productId)}
                      aria-label={`Remove ${orderItem.name}`}
                      className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-neutral-300">
                      <button
                        type="button"
                        onClick={() => changeQuantity(orderItem.productId, -1)}
                        aria-label={`Decrease quantity of ${orderItem.name}`}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span
                        className="min-w-8 text-center text-sm font-medium"
                        aria-live="polite"
                      >
                        {orderItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(orderItem.productId, 1)}
                        aria-label={`Increase quantity of ${orderItem.name}`}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-700">
                      {formatCurrency(orderItem.unitPrice * orderItem.quantity)}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <select
                      aria-label={`Ice preference for ${orderItem.name}`}
                      value={orderItem.ice ?? ""}
                      onChange={(e) =>
                        updateItem(orderItem.productId, {
                          ice: (e.target.value || undefined) as OrderItem["ice"],
                        })
                      }
                      className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
                    >
                      <option value="">Ice: regular</option>
                      <option value="extra">Ice: extra</option>
                      <option value="less">Ice: less</option>
                      <option value="no">Ice: none</option>
                    </select>
                    <select
                      aria-label={`Boba preference for ${orderItem.name}`}
                      value={orderItem.bobas ?? ""}
                      onChange={(e) =>
                        updateItem(orderItem.productId, {
                          bobas: (e.target.value || undefined) as OrderItem["bobas"],
                        })
                      }
                      className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
                    >
                      <option value="">Bobas: regular</option>
                      <option value="extra">Bobas: extra</option>
                      <option value="less">Bobas: less</option>
                      <option value="no">Bobas: none</option>
                    </select>
                    <input
                      aria-label={`Other instructions for ${orderItem.name}`}
                      value={orderItem.instructions ?? ""}
                      onChange={(e) =>
                        updateItem(orderItem.productId, { instructions: e.target.value })
                      }
                      placeholder="Other instructions"
                      className="col-span-2 rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-700"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <FieldError id="items-error" message={errors.items} />

          <dl className="mt-4 space-y-1 border-t border-neutral-100 pt-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            {adjustments.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <dt>Discount</dt>
                <dd>- {formatCurrency(adjustments.discount)}</dd>
              </div>
            )}
            {adjustments.deliveryFee > 0 && (
              <div className="flex justify-between text-neutral-600">
                <dt>Delivery fee</dt>
                <dd>+ {formatCurrency(adjustments.deliveryFee)}</dd>
              </div>
            )}
            {adjustments.manualExtraCharge > 0 && (
              <div className="flex justify-between text-neutral-600">
                <dt>Manual extra</dt>
                <dd>+ {formatCurrency(adjustments.manualExtraCharge)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-neutral-900">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          {isComplimentary && (
            <p className="mt-2 text-xs text-neutral-500">
              Complimentary order: total is Rs 0.
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <div>
            <label
              htmlFor="customerName"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Customer name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Walk-in customer"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={
                errors.customerName ? "customerName-error" : undefined
              }
              className={inputClass}
            />
            <FieldError
              id="customerName-error"
              message={errors.customerName}
            />
          </div>

          <div>
            <label
              htmlFor="customerPhone"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Phone{type === "delivery" ? "" : " (optional)"}
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0300-0000000"
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={
                errors.customerPhone ? "customerPhone-error" : undefined
              }
              className={inputClass}
            />
            <FieldError
              id="customerPhone-error"
              message={errors.customerPhone}
            />
          </div>

          {type === "delivery" ? (
            <>
              <div>
                <label htmlFor="deliveryAddress" className="mb-1 block text-sm font-medium text-neutral-700">
                  Full delivery address
                </label>
                <textarea
                  id="deliveryAddress"
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House/flat, street, area and city"
                  aria-invalid={Boolean(errors.deliveryAddress)}
                  aria-describedby={errors.deliveryAddress ? "deliveryAddress-error" : undefined}
                  className={inputClass}
                />
                <FieldError id="deliveryAddress-error" message={errors.deliveryAddress} />
              </div>
              <div>
                <label htmlFor="deliveryInstructions" className="mb-1 block text-sm font-medium text-neutral-700">
                  Delivery instructions (optional)
                </label>
                <input
                  id="deliveryInstructions"
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call on arrival"
                  className={inputClass}
                />
              </div>
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="orderType"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Order type
              </label>
              <select
                id="orderType"
                value={type}
                onChange={(e) => setType(e.target.value as OrderType)}
                className={inputClass}
              >
                {ORDER_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Payment
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className={inputClass}
              >
                {PAYMENT_METHODS.map((value) => (
                  <option key={value} value={value}>
                    {METHOD_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="paymentStatus" className="mb-1 block text-sm font-medium text-neutral-700">
                Payment status
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                disabled={isComplimentary}
                className={inputClass}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                {type === "delivery" ? <option value="due-on-delivery">Due on delivery</option> : null}
                {type === "takeaway" ? <option value="due-on-collection">Due on collection</option> : null}
              </select>
            </div>
          </div>

          {showDiscount && (
            <div>
              <label
                htmlFor="discount"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Discount in Rs (optional)
              </label>
              <input
                id="discount"
                type="text"
                inputMode="numeric"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                aria-invalid={Boolean(errors.discount)}
                aria-describedby={errors.discount ? "discount-error" : undefined}
                className={inputClass}
              />
              <FieldError id="discount-error" message={errors.discount} />
            </div>
          )}

          {showDeliveryFee && (
            <div>
              <label
                htmlFor="deliveryFee"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Delivery fee in Rs (optional)
              </label>
              <input
                id="deliveryFee"
                type="text"
                inputMode="numeric"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0"
                aria-invalid={Boolean(errors.deliveryFee)}
                aria-describedby={
                  errors.deliveryFee ? "deliveryFee-error" : undefined
                }
                className={inputClass}
              />
              <FieldError id="deliveryFee-error" message={errors.deliveryFee} />
            </div>
          )}

          {showDiscount ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="manualExtraCharge" className="mb-1 block text-sm font-medium text-neutral-700">
                  Manual extra in Rs
                </label>
                <input
                  id="manualExtraCharge"
                  type="text"
                  inputMode="numeric"
                  value={manualExtraCharge}
                  onChange={(e) => setManualExtraCharge(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="manualExtraDescription" className="mb-1 block text-sm font-medium text-neutral-700">
                  Extra-charge reason
                </label>
                <input
                  id="manualExtraDescription"
                  type="text"
                  value={manualExtraDescription}
                  onChange={(e) => setManualExtraDescription(e.target.value)}
                  placeholder="e.g. Extra syrup"
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isComplimentary}
              onChange={(e) => {
                setIsComplimentary(e.target.checked);
                // The "reason required" error no longer applies once unticked.
                setErrors((current) => ({ ...current, notes: undefined }));
              }}
              className="h-4 w-4 rounded border-neutral-300 accent-brand-600"
            />
            Complimentary order (free of charge)
          </label>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Notes{isComplimentary ? " (reason required)" : " (optional)"}
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "notes-error" : undefined}
              className={inputClass}
            />
            <FieldError id="notes-error" message={errors.notes} />
          </div>

          {isComplimentary ? (
            <div className="grid gap-3 rounded-lg bg-neutral-50 p-3 sm:grid-cols-3">
              <input aria-label="Complimentary recipient" value={complimentaryRecipient} onChange={(e) => setComplimentaryRecipient(e.target.value)} placeholder="Recipient" className={inputClass} />
              <input aria-label="Complimentary campaign" value={complimentaryCampaign} onChange={(e) => setComplimentaryCampaign(e.target.value)} placeholder="Campaign" className={inputClass} />
              <input aria-label="Complimentary approved by" value={complimentaryApprovedBy} onChange={(e) => setComplimentaryApprovedBy(e.target.value)} placeholder="Approved by" className={inputClass} />
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Create order
          </button>
          <p className="text-center text-xs text-neutral-400">
            Demo only. Orders are saved in this browser, not on a server.
          </p>
        </div>
      </aside>
    </form>
  );
}
