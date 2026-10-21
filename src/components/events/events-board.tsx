"use client";

import { useState, type SyntheticEvent } from "react";
import { CalendarPlus, Clock, MapPin, Users } from "lucide-react";

import { useEvents } from "@/hooks/use-events";
import {
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  buildEvent,
  formatEventTime,
  getEventPhase,
  sortNewestFirst,
  sortOldestFirst,
  validateNewEvent,
  type EventPhase,
  type NewEventErrors,
} from "@/lib/events";
import { formatDayLabel } from "@/lib/format";
import { shopDayOf } from "@/lib/sales-report";
import type { EventType, ShopEvent } from "@/types/event";

type EventFilter = "upcoming" | "past" | "cancelled" | "all";

const FILTERS: { value: EventFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

const TYPE_STYLES: Record<EventType, string> = {
  tasting: "bg-brand-50 text-brand-700",
  promotion: "bg-amber-50 text-amber-700",
  catering: "bg-blue-50 text-blue-700",
  community: "bg-neutral-100 text-neutral-700",
};

const PHASE_BADGES: Partial<Record<EventPhase, { label: string; style: string }>> = {
  today: { label: "Today", style: "bg-brand-600 text-white" },
  past: { label: "Past", style: "bg-neutral-100 text-neutral-600" },
  cancelled: { label: "Cancelled", style: "bg-red-50 text-red-700" },
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

/** Events shown for a filter, in a sensible order for that view. */
function eventsFor(
  filter: EventFilter,
  events: ShopEvent[],
  today: string,
): ShopEvent[] {
  const inPhase = (phases: EventPhase[]) =>
    events.filter((event) => phases.includes(getEventPhase(event, today)));

  switch (filter) {
    case "upcoming":
      return sortOldestFirst(inPhase(["today", "upcoming"]));
    case "past":
      return sortNewestFirst(inPhase(["past"]));
    case "cancelled":
      return sortOldestFirst(inPhase(["cancelled"]));
    default:
      return [
        ...sortOldestFirst(inPhase(["today", "upcoming"])),
        ...sortNewestFirst(inPhase(["past"])),
        ...sortOldestFirst(inPhase(["cancelled"])),
      ];
  }
}

export function EventsBoard() {
  const { events, addEvent, setCancelled } = useEvents();

  const [filter, setFilter] = useState<EventFilter>("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("tasting");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<NewEventErrors>({});

  if (!events) {
    return <p className="text-sm text-neutral-500">Loading events...</p>;
  }

  const today = shopDayOf(new Date());

  const counts: Record<EventFilter, number> = {
    upcoming: eventsFor("upcoming", events, today).length,
    past: eventsFor("past", events, today).length,
    cancelled: eventsFor("cancelled", events, today).length,
    all: events.length,
  };

  const visible = eventsFor(filter, events, today);

  function closeForm() {
    setShowForm(false);
    setTitle("");
    setType("tasting");
    setDate("");
    setTime("");
    setLocation("");
    setExpectedGuests("");
    setNotes("");
    setErrors({});
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!events) return;

    const input = { title, type, date, time, location, expectedGuests, notes };
    const foundErrors = validateNewEvent(input, today);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    addEvent(buildEvent(input, events));
    setFilter("upcoming");
    closeForm();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  filter === item.value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item.label} ({counts[item.value]})
              </button>
            ))}
          </div>

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              New event
            </button>
          ) : null}
        </div>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-4 grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="eventTitle"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Event title
              </label>
              <input
                id="eventTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "eventTitle-error" : undefined}
                className={inputClass}
              />
              <FieldError id="eventTitle-error" message={errors.title} />
            </div>

            <div>
              <label
                htmlFor="eventType"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Type
              </label>
              <select
                id="eventType"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className={inputClass}
              >
                {EVENT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {EVENT_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="eventLocation"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Location
              </label>
              <input
                id="eventLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={
                  errors.location ? "eventLocation-error" : undefined
                }
                className={inputClass}
              />
              <FieldError id="eventLocation-error" message={errors.location} />
            </div>

            <div>
              <label
                htmlFor="eventDate"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Date
              </label>
              <input
                id="eventDate"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "eventDate-error" : undefined}
                className={inputClass}
              />
              <FieldError id="eventDate-error" message={errors.date} />
            </div>

            <div>
              <label
                htmlFor="eventTime"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Start time
              </label>
              <input
                id="eventTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? "eventTime-error" : undefined}
                className={inputClass}
              />
              <FieldError id="eventTime-error" message={errors.time} />
            </div>

            <div>
              <label
                htmlFor="eventGuests"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Expected guests (optional)
              </label>
              <input
                id="eventGuests"
                type="number"
                inputMode="numeric"
                min={1}
                value={expectedGuests}
                onChange={(e) => setExpectedGuests(e.target.value)}
                aria-invalid={Boolean(errors.expectedGuests)}
                aria-describedby={
                  errors.expectedGuests ? "eventGuests-error" : undefined
                }
                className={inputClass}
              />
              <FieldError
                id="eventGuests-error"
                message={errors.expectedGuests}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="eventNotes"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="eventNotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Add event
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <p className="mt-5 text-sm text-neutral-500">
          {visible.length} of {events.length} events
        </p>

        {visible.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
            <p className="text-sm text-neutral-500">
              {events.length === 0
                ? "No events yet. Add your first event."
                : "No events in this view."}
            </p>
            {events.length > 0 && filter !== "all" ? (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-3 text-sm font-medium text-brand-600 hover:underline"
              >
                Show all events
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {visible.map((event) => {
              const phase = getEventPhase(event, today);
              const phaseBadge = PHASE_BADGES[phase];
              const [day, month] = formatDayLabel(event.date).split(" ");
              const canToggle = event.date >= today;
              const muted = phase === "past" || phase === "cancelled";

              return (
                <li
                  key={event.id}
                  className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div
                    className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg ${
                      muted
                        ? "bg-neutral-100 text-neutral-500"
                        : "bg-brand-50 text-brand-700"
                    }`}
                    aria-hidden="true"
                  >
                    <span className="text-xl font-semibold leading-none">
                      {day}
                    </span>
                    <span className="mt-1 text-xs font-medium uppercase">
                      {month}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-semibold ${
                          muted ? "text-neutral-500" : "text-neutral-900"
                        }`}
                      >
                        {event.title}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[event.type]}`}
                      >
                        {EVENT_TYPE_LABELS[event.type]}
                      </span>
                      {phaseBadge ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${phaseBadge.style}`}
                        >
                          {phaseBadge.label}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDayLabel(event.date)}
                    </p>

                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                      <li className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                        {formatEventTime(event.time)}
                      </li>
                      <li className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                        {event.location}
                      </li>
                      {event.expectedGuests ? (
                        <li className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                          {event.expectedGuests} guests
                        </li>
                      ) : null}
                    </ul>

                    {event.notes ? (
                      <p className="mt-2 text-sm text-neutral-600">
                        {event.notes}
                      </p>
                    ) : null}

                    {canToggle ? (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setCancelled(event.id, !event.isCancelled)
                          }
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                            event.isCancelled
                              ? "border-brand-600 bg-white text-brand-700 hover:bg-brand-50"
                              : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {event.isCancelled ? "Restore event" : "Cancel event"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-xs text-neutral-400">
        Demo only. Events are sample data saved in this browser. Cancelled
        events are kept and can be restored while their date has not passed.
      </p>
    </div>
  );
}
