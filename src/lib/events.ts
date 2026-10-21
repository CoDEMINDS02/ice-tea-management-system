import type { EventType, ShopEvent } from "@/types/event";

export const EVENT_TYPES: EventType[] = [
  "tasting",
  "promotion",
  "catering",
  "community",
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  tasting: "Tasting",
  promotion: "Promotion",
  catering: "Catering",
  community: "Community",
};

export type EventPhase = "today" | "upcoming" | "past" | "cancelled";

/** Where an event stands compared with today (both as "YYYY-MM-DD"). */
export function getEventPhase(event: ShopEvent, today: string): EventPhase {
  if (event.isCancelled) return "cancelled";
  if (event.date === today) return "today";

  return event.date > today ? "upcoming" : "past";
}

function eventKey(event: ShopEvent): string {
  return `${event.date}T${event.time}`;
}

/** Earliest first. */
export function sortOldestFirst(events: ShopEvent[]): ShopEvent[] {
  return [...events].sort((a, b) => eventKey(a).localeCompare(eventKey(b)));
}

/** Latest first. */
export function sortNewestFirst(events: ShopEvent[]): ShopEvent[] {
  return [...events].sort((a, b) => eventKey(b).localeCompare(eventKey(a)));
}

/** "18:30" -> "6:30 PM". Returns the text unchanged if it is not "HH:MM". */
export function formatEventTime(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match) return time;

  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hours12}:${match[2]} ${suffix}`;
}

export type NewEventInput = {
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  /** Typed text from the form. Empty means "not set". */
  expectedGuests: string;
  notes: string;
};

export type NewEventErrors = {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  expectedGuests?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_GUESTS = 10_000;

/** True for a real calendar day such as "2026-10-20" (not "2026-02-31"). */
function isRealDay(day: string): boolean {
  if (!DATE_PATTERN.test(day)) return false;

  const parsed = new Date(`${day}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}

/** Returns an error message per invalid field. An empty object means valid. */
export function validateNewEvent(
  input: NewEventInput,
  today: string,
): NewEventErrors {
  const errors: NewEventErrors = {};

  if (!input.title.trim()) {
    errors.title = "Event title is required.";
  }

  if (!input.date) {
    errors.date = "Choose a date.";
  } else if (!isRealDay(input.date)) {
    errors.date = "Enter a valid date.";
  } else if (input.date < today) {
    errors.date = "The date cannot be in the past.";
  }

  if (!input.time) {
    errors.time = "Choose a start time.";
  } else if (!TIME_PATTERN.test(input.time)) {
    errors.time = "Enter a valid time.";
  }

  if (!input.location.trim()) {
    errors.location = "Location is required.";
  }

  const guests = input.expectedGuests.trim();

  if (guests) {
    const count = Number(guests);

    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
      errors.expectedGuests = "Enter a whole number between 1 and 10,000.";
    }
  }

  return errors;
}

/** Turns valid form input into a new event with the next free id. */
export function buildEvent(
  input: NewEventInput,
  events: ShopEvent[],
): ShopEvent {
  const highest = events.reduce((max, event) => {
    const number = Number(event.id.replace("event-", ""));

    return Number.isFinite(number) && number > max ? number : max;
  }, 0);

  const guests = input.expectedGuests.trim();
  const notes = input.notes.trim();

  return {
    id: `event-${highest + 1}`,
    title: input.title.trim(),
    type: input.type,
    date: input.date,
    time: input.time,
    location: input.location.trim(),
    expectedGuests: guests ? Number(guests) : undefined,
    notes: notes || undefined,
    isCancelled: false,
  };
}
