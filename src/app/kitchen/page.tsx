import { KitchenBoard } from "@/components/kitchen/kitchen-board";

export default function KitchenPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Kitchen</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Orders being worked on, oldest first.
        </p>
      </div>

      <KitchenBoard />
    </div>
  );
}
