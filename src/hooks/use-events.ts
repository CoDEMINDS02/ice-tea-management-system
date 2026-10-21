"use client";

import { useCallback, useEffect, useState } from "react";

import { createDemoEvents } from "@/data/events";
import { EVENT_TYPES } from "@/lib/events";
import type { ShopEvent } from "@/types/event";

/** Change the version suffix if ShopEvent changes, so old saves are ignored. */
const STORAGE_KEY = "iced-tea-house:events:v1";

/** Basic shape check so broken or outdated saved data never reaches the UI. */
function isShopEvent(value: unknown): value is ShopEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as Partial<ShopEvent>;

  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.type === "string" &&
    EVENT_TYPES.includes(event.type) &&
    typeof event.date === "string" &&
    typeof event.time === "string" &&
    typeof event.location === "string" &&
    typeof event.isCancelled === "boolean" &&
    (event.expectedGuests === undefined ||
      typeof event.expectedGuests === "number")
  );
}

/** Saved events if they look valid, otherwise the demo events. */
function loadEvents(): ShopEvent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every(isShopEvent)) {
        return parsed;
      }
    }
  } catch {
    // Storage blocked or data corrupted: fall back to the demo events.
  }

  return createDemoEvents();
}

/**
 * Events, saved in this browser. `events` is null until the saved data has
 * loaded. Later this can be replaced by calls to the backend.
 */
export function useEvents() {
  const [events, setEvents] = useState<ShopEvent[] | null>(null);

  // Load once after the first render, so server and browser HTML match.
  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  // Save every change. Skipped until the first load has finished.
  useEffect(() => {
    if (!events) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [events]);

  const addEvent = useCallback((event: ShopEvent) => {
    setEvents((current) => (current ? [...current, event] : current));
  }, []);

  const setCancelled = useCallback((eventId: string, isCancelled: boolean) => {
    setEvents((current) =>
      current
        ? current.map((event) =>
            event.id === eventId ? { ...event, isCancelled } : event,
          )
        : current,
    );
  }, []);

  return { events, addEvent, setCancelled };
}
