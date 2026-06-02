"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import {
  ApiError,
  criarSala,
  entrarSala,
  listarMinhasSalas,
} from "@/lib/api";

export function SalasPage() {
  const { toast } = useToast();
  const [salas, setSalas] = useState<
    { id: number; nome: string; codigo_convite: string }[]
  >([]);
  const [nomeNova, setNomeNova] = useState("");
  const [codigoEntrar, setCodigoEntrar] = useState("");
  const [loading, setLoading] = useState(true);

  function carregar() {
    listarMinhasSalas()
      .then(setSalas)
      .catch(() => setSalas([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCriar() {
    if (!nomeNova.trim()) return;
    try {
      const res = await criarSala(nomeNova.trim());
      toast(`Sala criada! Código: ${res.codigoConvite}`, "success");
      setNomeNova("");
      carregar();
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  async function handleEntrar() {
    if (!codigoEntrar.trim()) return;
    try {
      await entrarSala(codigoEntrar.trim());
      toast("Você entrou na sala!", "success");
      setCodigoEntrar("");
      carregar();
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  return (
    <AppShell searchPlaceholder="Buscar salas...">
      <div className="px-4 lg:px-[40px] pt-8 pb-24 max-w-2xl">
        <h1 className="text-[32px] font-semibold mb-2">Salas de troca</h1>
        <p className="text-on-surface-variant mb-8 text-sm">
          Disponível para níveis Platina e Diamante. Crie uma sala ou entre com o
          código de convite.
        </p>

        <section className="bg-card-cream rounded-2xl p-6 premium-shadow mb-6">
          <p className="frik-label text-primary mb-3">Criar sala</p>
          <div className="flex gap-2">
            <input
              placeholder="Nome da sala"
              value={nomeNova}
              onChange={(e) => setNomeNova(e.target.value)}
              className="flex-1 bg-surface-container-high rounded-xl px-4 py-3"
            />
            <button
              type="button"
              onClick={handleCriar}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold"
            >
              Criar
            </button>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 mb-8">
          <p className="frik-label text-primary mb-3">Entrar com código</p>
          <div className="flex gap-2">
            <input
              placeholder="Código de convite"
              value={codigoEntrar}
              onChange={(e) => setCodigoEntrar(e.target.value.toUpperCase())}
              className="flex-1 bg-surface-container-high rounded-xl px-4 py-3 uppercase"
            />
            <button
              type="button"
              onClick={handleEntrar}
              className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold"
            >
              Entrar
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Minhas salas</h2>
          {loading ? (
            <p className="text-on-surface-variant">Carregando...</p>
          ) : salas.length === 0 ? (
            <p className="text-on-surface-variant">Você ainda não participa de nenhuma sala.</p>
          ) : (
            <ul className="space-y-3">
              {salas.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between items-center p-4 bg-surface-container-high rounded-xl"
                >
                  <div>
                    <p className="font-bold">{s.nome}</p>
                    <p className="text-xs text-primary font-mono mt-1">
                      {s.codigo_convite}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(s.codigo_convite);
                      toast("Código copiado!", "success");
                    }}
                    className="text-sm font-bold text-primary"
                  >
                    Copiar código
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
