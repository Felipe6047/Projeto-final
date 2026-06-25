"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import {
  adminCreateCampanha,
  adminDeleteCampanha,
  adminListCampanhas,
  adminUpdateCampanha,
  CampanhaAdmin,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const empty: CampanhaAdmin = {
  titulo: "",
  descricao: "",
  inicio_em: "",
  fim_em: "",
  ativa: true,
  multiplicador_pontos: 1.0,
  desconto_resgate_cupons: 0,
};

const NIVEIS = [
  { slug: "bronze", label: "Bronze" },
  { slug: "prata", label: "Prata" },
  { slug: "ouro", label: "Ouro" },
  { slug: "platina", label: "Platina" },
  { slug: "diamante", label: "Diamante" }
];

export function AdminCampanhasPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<CampanhaAdmin[]>([]);
  const [form, setForm] = useState<CampanhaAdmin>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLista(await adminListCampanhas());
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar campanhas", "error"));
  }, [load, toast]);

  function abrirNova() {
    setForm({
      ...empty,
      inicio_em: new Date().toISOString().slice(0, 16),
      fim_em: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    });
    setEditId(null);
    setOpen(true);
  }

  function abrirEditar(c: CampanhaAdmin) {
    setForm({
      titulo: c.titulo,
      descricao: c.descricao ?? "",
      inicio_em: String(c.inicio_em).slice(0, 16),
      fim_em: String(c.fim_em).slice(0, 16),
      ativa: Boolean(c.ativa),
      segmento_json: c.segmento_json,
      multiplicador_pontos: c.multiplicador_pontos ?? 1.0,
      desconto_resgate_cupons: c.desconto_resgate_cupons ?? 0,
    });
    setEditId(c.id!);
    setOpen(true);
  }

  async function salvar() {
    setLoading(true);
    try {
      const body = {
        ...form,
        ativa: Boolean(form.ativa),
        inicio_em: new Date(form.inicio_em).toISOString(),
        fim_em: new Date(form.fim_em).toISOString(),
      };
      if (editId) {
        await adminUpdateCampanha(editId, body);
        toast("Campanha atualizada", "success");
      } else {
        await adminCreateCampanha(body);
        toast("Campanha criada", "success");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir esta campanha?")) return;
    try {
      await adminDeleteCampanha(id);
      toast("Campanha removida", "success");
      await load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <AdminShell title="Campanhas" subtitle="Promoções e segmentação">
      <button
        type="button"
        onClick={abrirNova}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold"
      >
        Nova campanha
      </button>
      <div className="space-y-3">
        {lista.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="font-bold">{c.titulo}</p>
              <p className="text-sm text-on-surface-variant">
                {new Date(c.inicio_em).toLocaleDateString("pt-BR")} —{" "}
                {new Date(c.fim_em).toLocaleDateString("pt-BR")}
                {c.ativa ? " · Ativa" : " · Inativa"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => abrirEditar(c)}
                className="px-4 py-2 rounded-full border border-outline-variant text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => excluir(c.id!)}
                className="px-4 py-2 rounded-full border border-error/50 text-error text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      <AdminFormModal
        open={open}
        title={editId ? "Editar campanha" : "Nova campanha"}
        onClose={() => setOpen(false)}
        onSubmit={salvar}
        loading={loading}
      >
        <AdminField label="Título">
          <input
            className={adminInputClass()}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </AdminField>
        <AdminField label="Descrição">
          <textarea
            className={adminInputClass()}
            rows={2}
            value={form.descricao ?? ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </AdminField>
        <AdminField label="Início">
          <input
            type="datetime-local"
            className={adminInputClass()}
            value={form.inicio_em}
            onChange={(e) => setForm({ ...form, inicio_em: e.target.value })}
          />
        </AdminField>
        <AdminField label="Fim">
          <input
            type="datetime-local"
            className={adminInputClass()}
            value={form.fim_em}
            onChange={(e) => setForm({ ...form, fim_em: e.target.value })}
          />
        </AdminField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.ativa)}
            onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
          />
          Campanha ativa
        </label>

        <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-4">
          <h3 className="font-bold text-sm text-on-surface">Benefícios (Opcional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Multiplicador de Pontos (ex: 2.0 = Dobro)">
              <input
                type="number"
                step="0.1"
                min="1.0"
                className={adminInputClass()}
                value={form.multiplicador_pontos}
                onChange={(e) => setForm({ ...form, multiplicador_pontos: Number(e.target.value) })}
              />
            </AdminField>
            <AdminField label="Desconto Resgate (%)">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                className={adminInputClass()}
                value={form.desconto_resgate_cupons}
                onChange={(e) => setForm({ ...form, desconto_resgate_cupons: Number(e.target.value) })}
              />
            </AdminField>
          </div>
        </div>

        <div className="border-t border-outline-variant/20 pt-4 mt-4">
          <h3 className="font-bold text-sm text-on-surface mb-2">Público-Alvo (Segmentação)</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Selecione para restringir. Deixe tudo desmarcado para valer para todos.
          </p>
          <div className="flex flex-wrap gap-3">
            {NIVEIS.map(n => {
              const segmentos = (form.segmento_json as any)?.nivel_slug || [];
              const selecionado = segmentos.includes(n.slug);
              return (
                <label key={n.slug} className="flex items-center gap-2 text-sm bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/30 cursor-pointer hover:bg-surface-variant">
                  <input
                    type="checkbox"
                    className="accent-primary w-4 h-4"
                    checked={selecionado}
                    onChange={(e) => {
                      let novos = [...segmentos];
                      if (e.target.checked) novos.push(n.slug);
                      else novos = novos.filter(s => s !== n.slug);
                      setForm({
                        ...form,
                        segmento_json: novos.length ? { nivel_slug: novos } : undefined
                      });
                    }}
                  />
                  {n.label}
                </label>
              );
            })}
          </div>
        </div>
      </AdminFormModal>
    </AdminShell>
  );
}
