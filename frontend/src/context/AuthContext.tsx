"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthUser,
  clearToken,
  getPerfil,
  getToken,
  login as apiLogin,
  setToken,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  perfil: { id?: number; email?: string; nome: string; pontos: number; nivel: string; papel: string; saldo_wallet?: string | number; dias_ofensiva?: number } | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<"admin" | "cliente">;
  logout: () => void;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [perfil, setPerfil] = useState<{
    nome: string;
    pontos: number;
    nivel: string;
    papel: string;
    saldo_wallet?: string | number;
    dias_ofensiva?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPerfil = useCallback(async () => {
    if (!getToken()) return;
    try {
      const p = await getPerfil();
      setPerfil({
        nome: p.nome,
        pontos: p.pontos,
        nivel: p.nivel,
        papel: p.papel ?? "cliente",
        saldo_wallet: p.saldo_wallet,
        dias_ofensiva: p.dias_ofensiva ?? 0,
      });
      setUser({
        id: p.id,
        nome: p.nome,
        email: p.email,
        nivelId: 0,
        pontos: p.pontos,
        papel: p.papel ?? "cliente",
      });
    } catch {
      clearToken();
      setUser(null);
      setPerfil(null);
    }
  }, []);

  useEffect(() => {
    refreshPerfil().finally(() => setLoading(false));
  }, [refreshPerfil]);

  const login = async (email: string, senha: string) => {
    const res = await apiLogin(email, senha);
    setToken(res.token);
    const papel = res.usuario.papel ?? "cliente";
    setUser({ ...res.usuario, papel });
    setPerfil({
      nome: res.usuario.nome,
      pontos: res.usuario.pontos,
      nivel: "",
      papel,
    });
    await refreshPerfil();
    return papel as "admin" | "cliente";
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setPerfil(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        isAdmin: perfil?.papel === "admin" || user?.papel === "admin",
        loading,
        login,
        logout,
        refreshPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
