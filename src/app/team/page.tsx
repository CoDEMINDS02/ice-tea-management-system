import { TeamBoard } from "@/components/team/team-board";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Team &amp; roles
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Staff members and what each role can access.
        </p>
      </div>

      <TeamBoard />
    </div>
  );
}
