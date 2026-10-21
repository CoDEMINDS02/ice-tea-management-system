const SHOP_TIME_ZONE = "Asia/Karachi";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: SHOP_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: SHOP_TIME_ZONE,
});

/** 5660 -> "Rs 5,660" */
export function formatCurrency(amount: number): string {
  return `Rs ${currencyFormatter.format(amount)}`;
}

/** "2026-10-15" -> "15 Oct 2026". Returns "" for an empty day. */
export function formatDayLabel(day: string): string {
  if (!day) return "";

  return dayFormatter.format(new Date(`${day}T00:00:00.000Z`));
}

/** "2026-10-15T15:20:00.000Z" -> "8:20 PM" (shop time) */
export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

/** "2026-10-15T15:20:00.000Z" -> "15 Oct 2026, 8:20 PM" (shop time) */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}