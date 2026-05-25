"use client";

import { AdminSidebar } from "./AdminSidebar";
import { RequireAdmin } from "@/components/RequireAdmin";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background text-on-surface">
        <AdminSidebar />
        <div className="lg:ml-[280px] min-h-screen">
          <header className="h-20 flex justify-between items-center px-4 lg:px-10 border-b border-outline-variant/20 bg-background/90 sticky top-0 z-40 backdrop-blur-md">
            <div>
              <h1 className="text-headline-sm text-on-surface">{title}</h1>
              {subtitle && (
                <p className="text-sm text-on-surface-variant mt-0.5">{subtitle}</p>
              )}
            </div>
            <ThemeToggle />
          </header>
          <main className="p-4 lg:p-10 max-w-6xl">{children}</main>
        </div>
      </div>
    </RequireAdmin>
  );
}
