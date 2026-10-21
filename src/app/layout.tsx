import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CatalogProvider } from "@/components/catalog/catalog-provider";
import { OrdersProvider } from "@/components/orders/orders-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iced Tea House | Management System",
  description: "Demo management dashboard for an iced tea business.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <OrdersProvider>
          <CatalogProvider>
            <Suspense fallback={null}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </CatalogProvider>
        </OrdersProvider>
      </body>
    </html>
  );
}
