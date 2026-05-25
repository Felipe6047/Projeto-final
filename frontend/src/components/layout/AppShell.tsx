"use client";

import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { MobileNav } from "./MobileNav";
import { RequireAuth } from "@/components/RequireAuth";

interface AppShellProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function AppShell({
  children,
  searchPlaceholder,
  onSearch,
}: AppShellProps) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-on-surface">
        <Sidebar />
        <div className="lg:ml-[280px] min-h-screen relative overflow-hidden pb-24 lg:pb-0">
          <div className="organic-blob bg-primary-fixed-dim w-96 h-96 -top-20 -right-20 hidden lg:block" />
          <div className="organic-blob bg-secondary-fixed w-80 h-80 top-1/2 -left-20 hidden lg:block dark:opacity-20" />
          <TopHeader
            placeholder={searchPlaceholder}
            onSearch={onSearch}
          />
          {children}
        </div>
        <MobileNav />
      </div>
    </RequireAuth>
  );
}
