"use client";

import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";

import { useCatalog } from "@/components/catalog/catalog-provider";
import { useOrders } from "@/components/orders/orders-provider";
import { buildCategorySales, type CategorySales } from "@/lib/category-sales";
import { formatCurrency, formatDayLabel } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import {
  buildSalesReport,
  validateCustomRange,
  type CustomRange,
  type GroupTotals,
  type SalesPeriod,
} from "@/lib/sales-report";

const PERIODS: { value: SalesPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

/** "15 Oct 2026" -> "15 Oct" */
function shortDay(day: string): string {
  return formatDayLabel(day).replace(/\s\d{4}$/, "");
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function csvCell(value: string | number): string {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function BreakdownCard({
  title,
  rows,
  totalSales,
}: {
  title: string;
  rows: { label: string; totals: GroupTotals }[];
  totalSales: number;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">
          No sales in this period.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => {
            const share =
              totalSales > 0
                ? Math.round((row.totals.sales / totalSales) * 100)
                : 0;

            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{row.label}</span>
                  <span className="text-neutral-900">
                    {formatCurrency(row.totals.sales)}
                    <span className="ml-2 text-xs text-neutral-500">
                      {row.totals.orders}{" "}
                      {row.totals.orders === 1 ? "order" : "orders"}
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100"
                  role="img"
                  aria-label={`${row.label}: ${share}% of sales`}
                >
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CategoryCard({ rows }: { rows: CategorySales[] }) {
  // Shares are measured against the category total, so the bars add up to 100%.
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">By category</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Item prices times quantity, using each product&apos;s current category.
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">
          No products sold in this period.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => {
            const share =
              totalRevenue > 0
                ? Math.round((row.revenue / totalRevenue) * 100)
                : 0;

            return (
              <li key={row.categoryId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{row.name}</span>
                  <span className="text-neutral-900">
                    {formatCurrency(row.revenue)}
                    <span className="ml-2 text-xs text-neutral-500">
                      {row.quantity} sold
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100"
                  role="img"
                  aria-label={`${row.name}: ${share}% of category sales`}
                >
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ReportsBoard() {
  const { orders } = useOrders();
  const { categories, products } = useCatalog();
  const [period, setPeriod] = useState<SalesPeriod>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const customRange = useMemo<CustomRange>(
    () => ({ from: customFrom, to: customTo }),
    [customFrom, customTo],
  );

  const customError =
    period === "custom" ? validateCustomRange(customRange) : null;

  const report = useMemo(
    () => buildSalesReport(orders, period, new Date(), customRange),
    [orders, period, customRange],
  );

  const categorySales = useMemo(
    () => buildCategorySales(report.soldProducts, products, categories),
    [report.soldProducts, products, categories],
  );

  const maxDaily = Math.max(...report.daily.map((d) => d.sales), 0);
  const showEveryLabel = report.daily.length <= 7;

  const rangeLabel =
    report.fromDay === report.toDay
      ? formatDayLabel(report.fromDay)
      : `${formatDayLabel(report.fromDay)} to ${formatDayLabel(report.toDay)}`;

  function downloadExcelCsv() {
    const rows: Array<Array<string | number>> = [
      ["Iced Tea House sales report"],
      ["Period", rangeLabel],
      [],
      ["Summary"],
      ["Sales", report.sales],
      ["Orders", report.orderCount],
      ["Average order", report.averageOrderValue],
      ["Refunded", report.refunded],
      ["Unpaid", report.unpaid],
      ["Complimentary value", report.complimentaryValue],
      ["Discounts", report.discounts],
      ["Delivery fees", report.deliveryFees],
      [],
      ["Payment method", "Sales", "Orders"],
      ...(Object.keys(report.byPaymentMethod) as Array<
        keyof typeof report.byPaymentMethod
      >).map((method) => [
        METHOD_LABELS[method],
        report.byPaymentMethod[method].sales,
        report.byPaymentMethod[method].orders,
      ]),
      [],
      ["Order type", "Sales", "Orders"],
      ...(Object.keys(report.byOrderType) as Array<
        keyof typeof report.byOrderType
      >).map((type) => [
        TYPE_LABELS[type],
        report.byOrderType[type].sales,
        report.byOrderType[type].orders,
      ]),
      [],
      ["Product", "Quantity", "Revenue"],
      ...report.topProducts.map((product) => [
        product.name,
        product.quantity,
        product.revenue,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iced-tea-house-report-${report.fromDay}-to-${report.toDay}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div>
        <div className="flex flex-wrap items-center gap-2" data-print-hide>
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                period === item.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === "custom" ? (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="reportFrom"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                From
              </label>
              <input
                id="reportFrom"
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? "reportRange-error" : undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="reportTo"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                To
              </label>
              <input
                id="reportTo"
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? "reportRange-error" : undefined}
                className={inputClass}
              />
            </div>
          </div>
        ) : null}

        {customError ? (
          <p
            id="reportRange-error"
            role="alert"
            className="mt-2 text-sm text-red-600"
          >
            {customError} Showing today until a valid range is chosen.
          </p>
        ) : null}

        <p className="mt-2 text-sm text-neutral-500">
          {rangeLabel} (shop time, Karachi)
        </p>
        <div className="mt-3 flex flex-wrap gap-2" data-print-hide>
          <button
            type="button"
            onClick={downloadExcelCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Excel (CSV)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sales"
          value={formatCurrency(report.sales)}
          hint="Excludes cancelled, complimentary and refunded"
        />
        <StatCard
          label="Orders"
          value={String(report.orderCount)}
          hint={`${report.cancelledCount} cancelled`}
        />
        <StatCard
          label="Average order"
          value={formatCurrency(report.averageOrderValue)}
        />
        <StatCard
          label="Refunded"
          value={formatCurrency(report.refunded)}
          hint="Not deducted from sales again"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unpaid (part of sales)"
          value={formatCurrency(report.unpaid)}
          hint="Not collected yet, e.g. cash on delivery"
        />
        <StatCard
          label="Complimentary"
          value={`${report.complimentaryCount} ${
            report.complimentaryCount === 1 ? "order" : "orders"
          }`}
          hint={`Menu value ${formatCurrency(report.complimentaryValue)}, not in sales`}
        />
        <StatCard
          label="Discounts given"
          value={formatCurrency(report.discounts)}
          hint="Already taken off sales"
        />
        <StatCard
          label="Delivery fees"
          value={formatCurrency(report.deliveryFees)}
          hint="Already included in sales"
        />
      </div>

      {/* Daily chart */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Daily sales</h3>

        {report.orderCount === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500">
            No sales in this period. Try a longer period.
          </div>
        ) : (
          <>
            <div
              className="mt-4 flex h-48 items-end gap-1"
              role="img"
              aria-label={`Bar chart of daily sales, ${rangeLabel}`}
            >
              {report.daily.map((day) => {
                const height =
                  maxDaily > 0 ? Math.max((day.sales / maxDaily) * 100, 2) : 2;

                return (
                  <div
                    key={day.day}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    title={`${formatDayLabel(day.day)}: ${formatCurrency(
                      day.sales,
                    )} (${day.orders} ${day.orders === 1 ? "order" : "orders"})`}
                  >
                    <div
                      className={`w-full rounded-t ${
                        day.sales > 0 ? "bg-brand-600" : "bg-neutral-200"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {showEveryLabel ? (
              <div className="mt-2 flex gap-1">
                {report.daily.map((day) => (
                  <p
                    key={day.day}
                    className="min-w-0 flex-1 truncate text-center text-xs text-neutral-500"
                  >
                    {shortDay(day.day)}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-2 flex justify-between text-xs text-neutral-500">
                <span>{shortDay(report.fromDay)}</span>
                <span>{shortDay(report.toDay)}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              Hover over a bar to see that day&apos;s total.
            </p>
          </>
        )}
      </section>

      {/* Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownCard
          title="By payment method"
          totalSales={report.sales}
          rows={(Object.keys(report.byPaymentMethod) as Array<
            keyof typeof report.byPaymentMethod
          >).map((key) => ({
            label: METHOD_LABELS[key],
            totals: report.byPaymentMethod[key],
          }))}
        />
        <BreakdownCard
          title="By order type"
          totalSales={report.sales}
          rows={(Object.keys(report.byOrderType) as Array<
            keyof typeof report.byOrderType
          >).map((key) => ({
            label: TYPE_LABELS[key],
            totals: report.byOrderType[key],
          }))}
        />
      </div>

      <BreakdownCard
        title="By staff"
        totalSales={report.sales}
        rows={report.byStaff.map((staff) => ({
          label: staff.name,
          totals: { sales: staff.sales, orders: staff.orders },
        }))}
      />

      <CategoryCard rows={categorySales} />

      {/* Top products */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Top products</h3>

        {report.topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No products sold in this period.
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-neutral-100">
            {report.topProducts.map((product, index) => (
              <li
                key={product.productId}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {product.name}
                  </span>
                </div>
                <div className="text-right text-neutral-700">
                  {product.quantity} sold
                  <span className="ml-3 text-neutral-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-xs text-neutral-400">
        Demo only. Figures come from the sample and locally saved orders.
      </p>
    </div>
  );
}
