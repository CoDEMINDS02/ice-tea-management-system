import { ReportsBoard } from "@/components/reports/reports-board";

// Opt this page out of Next.js's instant-navigation check (a dev-mode warning).
export const instant = false;

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Sales reports
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sales, payments and best-selling products for a chosen period.
        </p>
      </div>

      <ReportsBoard />
    </div>
  );
}