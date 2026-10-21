import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{title}</p>

        {icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>

      {description ? (
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}