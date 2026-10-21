import { EventsBoard } from "@/components/events/events-board";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Events</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Tastings, promotions and catering at the Iced Tea House.
        </p>
      </div>

      <EventsBoard />
    </div>
  );
}