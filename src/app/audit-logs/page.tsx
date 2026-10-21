import { AuditLogsBoard } from "@/components/audit-logs/audit-logs-board";

export default function AuditLogsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Audit logs</h2>
        <p className="mt-1 text-sm text-neutral-500">
          A record of order activity: who did what, and when.
        </p>
      </div>

      <AuditLogsBoard />
    </div>
  );
}
