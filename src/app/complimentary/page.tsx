import { ComplimentaryBoard } from "@/components/complimentary/complimentary-board";

export default function ComplimentaryPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Complimentary
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Free orders and how much menu value was given away.
        </p>
      </div>

      <ComplimentaryBoard />
    </div>
  );
}
