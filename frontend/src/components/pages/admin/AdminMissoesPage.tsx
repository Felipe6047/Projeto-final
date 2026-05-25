"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import {
  adminCreateMissao,
  adminDeleteMissao,
  adminListMissoes,
  adminUpdateMissao,
  MissaoAdmin,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const empty: MissaoAdmin = {
  titulo: "",
  pontos_recompensa: 100,
  meta_valor: 1,
  tipo_meta: "trocas",
  ativa: true,
};

export function AdminMissoesPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<MissaoAdmin[]>([]);
  const [form, setForm] = useState<MissaoAdmin>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLista(await adminListMissoes());
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar missões", "error"));
  }, [load, toast]);

  async function salvar() {
    setLoading(true);
    try {
      const body = { ...form, ativa: Boolean(form.ativa) };
      if (editId) {
        await adminUpdateMissao(editId, body);
        toast("Missão atualizada", "success");
      } else {
        await adminCreateMissao(body as Omit<MissaoAdmin, "id">);
        toast("Missão criada", "success");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell title="Missões" subtitle="Gamificação e recompensas">
      <button
        type="button"
        onClick={() => {
          setForm(empty);
          setEditId(null);
          setOpen(true);
        }}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold"
      >
        Nova missão
      </button>
      <div className="space-y-3">
        {lista.map((m) => (
          <div
            key={m.id}
            className="flex flex-wrap justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="font-bold">{m.titulo}</p>
              <p className="text-sm text-on-surface-variant">
                {m.tipo_meta} · meta {m.meta_valor} · +{m.pontos_recompensa} pts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(m);
                  setEditId(m.id!);
                  setOpen(true);
                }}
                className="px-4 py-2 rounded-full border border-outline-variant text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Excluir missão?")) return;
                  await adminDeleteMissao(m.id!);
                  toast("Removida", "success");
                  await load();
                }}
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
        title={editId ? "Editar missão" : "Nova missão"}
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
        <AdminField label="Tipo de meta">
          <select
            className={adminInputClass()}
            value={form.tipo_meta}
            onChange={(e) =>
              setForm({
                ...form,
                tipo_meta: e.target.value as MissaoAdmin["tipo_meta"],
              })
            }
          >
            <option value="compras">Compras</option>
            <option value="trocas">Trocas</option>
            <option value="presentes">Presentes</option>
            <option value="pontos">Pontos</option>
          </select>
        </AdminField>
        <AdminField label="Meta (quantidade)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.meta_valor ?? 1}
            onChange={(e) =>
              setForm({ ...form, meta_valor: Number(e.target.value) })
            }
          />
        </AdminField>
        <AdminField label="Pontos de recompensa">
          <input
            type="number"
            className={adminInputClass()}
            value={form.pontos_recompensa}
            onChange={(e) =>
              setForm({ ...form, pontos_recompensa: Number(e.target.value) })
            }
          />
        </AdminField>
      </AdminFormModal>
    </AdminShell>
  );
}
