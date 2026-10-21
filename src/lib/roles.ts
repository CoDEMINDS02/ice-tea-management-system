import type { PermissionArea, Role } from "@/types/team";

export const ROLES: Role[] = [
  "owner",
  "manager",
  "cashier",
  "kitchen",
  "delivery",
];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  kitchen: "Kitchen",
  delivery: "Delivery",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access, including team and settings.",
  manager: "Runs daily operations, the menu and sales reports.",
  cashier: "Takes orders and handles payments.",
  kitchen: "Prepares orders on the kitchen display.",
  delivery: "Handles delivery orders.",
};

export const PERMISSION_AREAS: PermissionArea[] = [
  "orders",
  "kitchen",
  "payments",
  "delivery",
  "catalog",
  "reports",
  "team",
  "settings",
];

export const AREA_LABELS: Record<PermissionArea, string> = {
  orders: "Orders",
  kitchen: "Kitchen",
  payments: "Payments",
  delivery: "Delivery",
  catalog: "Menu & categories",
  reports: "Sales reports",
  team: "Team & roles",
  settings: "Settings",
};

/**
 * What each role may open. This is a plan for the real system: the demo
 * app does not enforce it anywhere yet.
 */
export const ROLE_PERMISSIONS: Record<Role, PermissionArea[]> = {
  owner: [...PERMISSION_AREAS],
  manager: [
    "orders",
    "kitchen",
    "payments",
    "delivery",
    "catalog",
    "reports",
  ],
  cashier: ["orders", "payments"],
  kitchen: ["kitchen"],
  delivery: ["delivery"],
};

export function hasPermission(role: Role, area: PermissionArea): boolean {
  return ROLE_PERMISSIONS[role].includes(area);
}
