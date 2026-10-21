import { shopDayOf } from "@/lib/sales-report";
import type { ShopEvent } from "@/types/event";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The shop day that is `offset` days from today (negative = in the past). */
function dayFromNow(offset: number): string {
  return shopDayOf(new Date(Date.now() + offset * DAY_MS));
}

/**
 * Demo events with dates worked out from today, so the list always has some
 * past, current and upcoming events. All places and details are made up.
 */
export function createDemoEvents(): ShopEvent[] {
  return [
    {
      id: "event-1",
      title: "Peach Iced Tea Tasting",
      type: "tasting",
      date: dayFromNow(-8),
      time: "16:00",
      location: "Main shop floor",
      expectedGuests: 25,
      notes: "Free samples of Peach Iced Tea for walk-in customers.",
      isCancelled: false,
    },
    {
      id: "event-2",
      title: "Office Catering: 40 Cups",
      type: "catering",
      date: dayFromNow(-2),
      time: "13:00",
      location: "Customer office",
      expectedGuests: 40,
      notes: "Mix of Lemon and Mint Iced Tea.",
      isCancelled: false,
    },
    {
      id: "event-3",
      title: "Buy 2 Get 1 Iced Tea Day",
      type: "promotion",
      date: dayFromNow(0),
      time: "11:00",
      location: "In shop",
      isCancelled: false,
    },
    {
      id: "event-4",
      title: "Weekend Tasting",
      type: "tasting",
      date: dayFromNow(3),
      time: "17:00",
      location: "Main shop floor",
      expectedGuests: 30,
      notes: "House Blend and Fresh Lemonade samples.",
      isCancelled: false,
    },
    {
      id: "event-5",
      title: "Community Cleanup Drive",
      type: "community",
      date: dayFromNow(9),
      time: "09:00",
      location: "Neighbourhood park",
      expectedGuests: 15,
      notes: "Postponed because of the weather forecast.",
      isCancelled: true,
    },
    {
      id: "event-6",
      title: "Wedding Catering Order",
      type: "catering",
      date: dayFromNow(16),
      time: "18:30",
      location: "Banquet hall (to be confirmed)",
      expectedGuests: 120,
      notes: "Needs 120 cups of House Blend. Confirm the venue first.",
      isCancelled: false,
    },
    {
      id: "event-7",
      title: "New Menu Launch",
      type: "promotion",
      date: dayFromNow(30),
      time: "12:00",
      location: "Main shop floor",
      expectedGuests: 60,
      isCancelled: false,
    },
  ];
}
