"use client";

import { Banknote, Clock, Receipt, ShoppingBag } from "lucide-react";

import { RecentOrders } from "@/components/dashboard/recent-orders";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";
import { TopProducts } from "@/components/dashboard/top-products";
import { useOrders } from "@/components/orders/orders-provider";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { formatCurrency, formatDayLabel } from "@/lib/format";

export function DashboardView() {
  const { orders } = useOrders();
  const stats = getDashboardStats(orders);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Welcome back</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Here is an overview of the Iced Tea House for{" "}
          {formatDayLabel(stats.day)}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's sales"
          value={formatCurrency(stats.salesToday)}
          description="Cancelled and complimentary orders add nothing"
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          title="Today's orders"
          value={stats.ordersToday}
          description="Cancelled orders are not counted"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          title="Active orders"
          value={stats.activeOrders}
          description="Pending, preparing or ready"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Average order value"
          value={formatCurrency(stats.averageOrderValue)}
          description="Complimentary orders are not counted"
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StatusBreakdown counts={stats.statusCounts} />
        <TopProducts products={stats.topProducts} />
      </div>

      <div className="mt-6">
        <RecentOrders orders={orders} />
      </div>
    </div>
  );
}
