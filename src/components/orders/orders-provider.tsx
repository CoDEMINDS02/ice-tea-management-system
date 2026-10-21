"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createDemoOrders } from "@/data/orders";
import {
  AUDIT_STORAGE_KEY,
  addAuditLog,
  capitalize,
  createAuditLog,
  loadAuditLogs,
} from "@/lib/audit-log";
import { formatCurrency } from "@/lib/format";
import { METHOD_LABELS } from "@/lib/order-labels";
import { canMove } from "@/lib/order-workflow";
import { canMarkPaid, needsRefund } from "@/lib/payment-workflow";
import type { AuditLog } from "@/types/audit-log";
import type { Order, OrderStatus } from "@/types/order";

/** Change the version suffix if the Order type changes, so old saves are ignored. */
const STORAGE_KEY = "iced-tea-house:orders:v1";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

/** Basic shape check so broken or outdated saved data never reaches the UI. */
function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;

  const order = value as Partial<Order>;

  return (
    typeof order.id === "string" &&
    typeof order.orderNumber === "string" &&
    typeof order.customerName === "string" &&
    typeof order.total === "number" &&
    typeof order.createdAt === "string" &&
    Array.isArray(order.items) &&
    typeof order.status === "string" &&
    ORDER_STATUSES.includes(order.status)
  );
}

/** Saved orders if they look valid, otherwise fresh demo orders. */
function loadOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every(isOrder)) {
        return parsed;
      }
    }
  } catch {
    // Storage blocked or data corrupted: fall back to demo orders.
  }

  return createDemoOrders();
}

type OrdersContextValue = {
  orders: Order[];
  /** Newest first. Written automatically by the actions below. */
  auditLogs: AuditLog[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
  /** Throws away all changes and restores the original demo orders. */
  resetDemoData: () => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

type OrdersProviderProps = {
  children: ReactNode;
};

export function OrdersProvider({ children }: OrdersProviderProps) {
  // null until the browser has loaded saved data (or built demo orders).
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[] | null>(null);

  // Latest orders, so actions can check an order before they log it.
  const ordersRef = useRef<Order[] | null>(null);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Load once after the first render, so server and browser HTML match.
  useEffect(() => {
    setOrders(loadOrders());
    setAuditLogs(loadAuditLogs());
  }, []);

  // Save every change. Skipped until the first load has finished.
  useEffect(() => {
    if (!orders) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [orders]);

  useEffect(() => {
    if (!auditLogs) return;

    try {
      window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [auditLogs]);

  const addLog = useCallback((entry: AuditLog) => {
    setAuditLogs((current) => (current ? addAuditLog(current, entry) : current));
  }, []);

  const addOrder = useCallback(
    (order: Order) => {
      setOrders((current) => (current ? [order, ...current] : current));
      addLog(
        createAuditLog(
          "order_created",
          `Order ${order.orderNumber} created for ${order.customerName} (${formatCurrency(order.total)})`,
          order,
        ),
      );
    },
    [addLog],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const target = ordersRef.current?.find((order) => order.id === orderId);

      if (!target || !canMove(target.status, status)) return;

      setOrders((current) =>
        current
          ? current.map((order) =>
              order.id === orderId && canMove(order.status, status)
                ? { ...order, status }
                : order,
            )
          : current,
      );
      addLog(
        createAuditLog(
          "status_changed",
          `Order ${target.orderNumber}: ${capitalize(target.status)} to ${capitalize(status)}`,
          target,
        ),
      );
    },
    [addLog],
  );

  const markOrderPaid = useCallback(
    (orderId: string) => {
      const target = ordersRef.current?.find((order) => order.id === orderId);

      if (!target || !canMarkPaid(target)) return;

      setOrders((current) =>
        current
          ? current.map((order) =>
              order.id === orderId && canMarkPaid(order)
                ? { ...order, paymentStatus: "paid" as const }
                : order,
            )
          : current,
      );
      addLog(
        createAuditLog(
          "payment_recorded",
          `Payment recorded for ${target.orderNumber} (${METHOD_LABELS[target.paymentMethod]}, ${formatCurrency(target.total)})`,
          target,
        ),
      );
    },
    [addLog],
  );

  const refundOrder = useCallback(
    (orderId: string) => {
      const target = ordersRef.current?.find((order) => order.id === orderId);

      if (!target || !needsRefund(target)) return;

      setOrders((current) =>
        current
          ? current.map((order) =>
              order.id === orderId && needsRefund(order)
                ? { ...order, paymentStatus: "refunded" as const }
                : order,
            )
          : current,
      );
      addLog(
        createAuditLog(
          "refund_processed",
          `Refund processed for ${target.orderNumber} (${formatCurrency(target.total)})`,
          target,
        ),
      );
    },
    [addLog],
  );

  const resetDemoData = useCallback(() => {
    setOrders(createDemoOrders());
    addLog(
      createAuditLog("demo_data_reset", "All orders reset to the original demo data"),
    );
  }, [addLog]);

  const value = useMemo(
    () =>
      orders && auditLogs
        ? {
            orders,
            auditLogs,
            addOrder,
            updateOrderStatus,
            markOrderPaid,
            refundOrder,
            resetDemoData,
          }
        : null,
    [
      orders,
      auditLogs,
      addOrder,
      updateOrderStatus,
      markOrderPaid,
      refundOrder,
      resetDemoData,
    ],
  );

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used inside an OrdersProvider");
  }

  return context;
}
