export type EventType = "tasting" | "promotion" | "catering" | "community";

/** Named ShopEvent so it never clashes with the browser's built-in Event type. */
export type ShopEvent = {
  id: string;
  title: string;
  type: EventType;
  /** Shop day as "YYYY-MM-DD". */
  date: string;
  /** Start time as "HH:MM" (24 hour). */
  time: string;
  location: string;
  expectedGuests?: number;
  notes?: string;
  /** Cancelled events stay in the list and can be restored. */
  isCancelled: boolean;
};
