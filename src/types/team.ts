export type Role = "owner" | "manager" | "cashier" | "kitchen" | "delivery";

/** The parts of the system a role can be given access to. */
export type PermissionArea =
  | "orders"
  | "kitchen"
  | "payments"
  | "delivery"
  | "catalog"
  | "reports"
  | "team"
  | "settings";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Inactive members are kept in the list but cannot be given work. */
  isActive: boolean;
  /** Shop day the member joined, as "YYYY-MM-DD". */
  joinedOn: string;
};
