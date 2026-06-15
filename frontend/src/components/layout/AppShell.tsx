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
          <div className="organic-blob bg-primary/20 w-[600px] h-[600px] -top-40 -right-40 hidden lg:block blur-3xl absolute opacity-50 dark:opacity-20 pointer-events-none" />
          <div className="organic-blob bg-secondary/20 w-[500px] h-[500px] top-1/3 -left-40 hidden lg:block blur-3xl absolute opacity-40 dark:opacity-10 pointer-events-none" />
          <div className="organic-blob bg-tertiary/20 w-[700px] h-[700px] -bottom-40 right-20 hidden lg:block blur-3xl absolute opacity-30 dark:opacity-10 pointer-events-none" />
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
