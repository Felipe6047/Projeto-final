"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/api";

const PUBLIC_PATHS = ["/login"];
const ADMIN_PREFIX = "/admin";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
    if (isAdminRoute) return;
    if (!isPublic && !getToken() && !user) {
      router.replace("/login");
    }
  }, [loading, user, pathname, router]);

  if (loading && !PUBLIC_PATHS.includes(pathname) && !pathname.startsWith(ADMIN_PREFIX)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
