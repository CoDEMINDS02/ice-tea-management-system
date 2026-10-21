import { SettingsBoard } from "@/components/settings/settings-board";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Shop details and demo data options.
        </p>
      </div>

      <SettingsBoard />
    </div>
  );
}
