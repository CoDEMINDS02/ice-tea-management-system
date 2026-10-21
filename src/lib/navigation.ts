import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChefHat,
  CreditCard,
  Gift,
  LayoutDashboard,
  Plus,
  ScrollText,
  Settings,
  ShoppingBag,
  Tags,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingBag },
      { label: "New order", href: "/orders/new", icon: Plus },
      { label: "Kitchen", href: "/kitchen", icon: ChefHat },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Delivery", href: "/delivery", icon: Truck },
      { label: "Complimentary", href: "/complimentary", icon: Gift },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Menu & Products", href: "/menu", icon: UtensilsCrossed },
      { label: "Categories", href: "/categories", icon: Tags },
      { label: "Recipes", href: "/recipes", icon: BookOpen },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Sales Reports", href: "/reports", icon: BarChart3 },
      { label: "Events", href: "/events", icon: CalendarDays },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Team & Roles", href: "/team", icon: UserCog },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Flat list of every nav item, useful for finding the current page title. */
export const allNavItems: NavItem[] = navSections.flatMap(
  (section) => section.items,
);
