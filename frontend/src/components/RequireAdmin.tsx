"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/api";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!getToken() && !user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-on-surface-variant">Carregando painel...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
