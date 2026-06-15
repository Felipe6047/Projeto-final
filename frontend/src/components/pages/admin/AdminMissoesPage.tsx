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
        className="mb-8 flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold shadow-md hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined">add</span>
        Nova missão
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lista.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col justify-between p-6 rounded-2xl border transition-all ${m.ativa ? 'bg-surface-container-low border-outline-variant/30 premium-shadow' : 'bg-surface-container border-outline-variant/10 opacity-70'}`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-bold text-lg text-on-surface">{m.titulo}</h5>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${m.ativa ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {m.tipo_meta}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                Meta: {m.meta_valor}
              </p>
              <div className="flex items-center gap-1 text-primary font-bold bg-primary-container/20 w-fit px-3 py-1.5 rounded-full mb-6 border border-primary/10">
                <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                +{m.pontos_recompensa} pts
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setForm(m);
                  setEditId(m.id!);
                  setOpen(true);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
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
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-error/20 bg-error/5 text-error hover:bg-error hover:text-white transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
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
