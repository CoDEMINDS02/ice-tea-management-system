import type { StatusCounts } from "@/lib/dashboard-stats";
import type { OrderStatus } from "@/types/order";

type StatusBreakdownProps = {
  counts: StatusCounts;
};

const STATUS_ROWS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "bg-amber-500" },
  { status: "preparing", label: "Preparing", color: "bg-blue-500" },
  { status: "ready", label: "Ready", color: "bg-violet-500" },
  { status: "completed", label: "Completed", color: "bg-green-500" },
  { status: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export function StatusBreakdown({ counts }: StatusBreakdownProps) {
  const total = STATUS_ROWS.reduce((sum, row) => sum + counts[row.status], 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-neutral-900">
          Orders by status
        </h3>
        <p className="text-sm text-neutral-500">{total} total</p>
      </div>

      <ul className="mt-4 space-y-4">
        {STATUS_ROWS.map((row) => {
          const count = counts[row.status];
          const percent = total > 0 ? (count / total) * 100 : 0;

          return (
            <li key={row.status}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-neutral-700">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${row.color}`}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="font-medium text-neutral-900">{count}</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}