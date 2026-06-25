"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import { useToast } from "@/context/ToastContext";
"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

interface Conquista {
  id?: number;
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  meta_tipo: string;
  meta_valor: number;
  pontos_bonus: number;
}



const ICONES = [
  "emoji_events", "military_tech", "workspace_premium", "star",
  "local_fire_department", "bolt", "verified", "diamond",
  "shopping_bag", "swap_horiz", "redeem", "favorite",
];

const empty: Conquista = {
  slug: "",
  nome: "",
  descricao: "",
  icone: "emoji_events",
  meta_tipo: "compras_count",
  meta_valor: 1,
  pontos_bonus: 0,
};

export function AdminConquistasPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<Conquista[]>([]);
  const [form, setForm] = useState<Conquista>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await api<Conquista[]>("/admin/conquistas");
    setLista(data);
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar conquistas", "error"));
  }, [load, toast]);

  async function salvar() {
    setLoading(true);
    try {
      if (editId) {
        await api(`/admin/conquistas/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast("Conquista atualizada!", "success");
      } else {
        await api("/admin/conquistas", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Conquista criada!", "success");
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
    <AdminShell title="Conquistas & Badges" subtitle="Troféus e recompensas de gamificação">
      <button
        type="button"
        onClick={() => {
          setForm(empty);
          setEditId(null);
          setOpen(true);
        }}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Nova Conquista
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {lista.map((c) => (
          <div
            key={c.id ?? c.slug}
            className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {c.icone || "emoji_events"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{c.nome}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{c.descricao}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(c);
                setEditId(c.id!);
                setOpen(true);
              }}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        ))}
        {lista.length === 0 && (
          <div className="col-span-3 text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-2">emoji_events</span>
            <p>Nenhuma conquista cadastrada ainda.</p>
          </div>
        )}
      </div>

      <AdminFormModal
        open={open}
        title={editId ? "Editar Conquista" : "Nova Conquista"}
        onClose={() => setOpen(false)}
        onSubmit={salvar}
        loading={loading}
      >
        <AdminField label="Nome *">
          <input
            className={adminInputClass()}
            value={form.nome}
            onChange={(e) => {
              const nome = e.target.value;
              const slug = nome.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
              setForm({ ...form, nome, slug });
            }}
            placeholder="Ex: Primeiro Comprador"
          />
        </AdminField>
        <AdminField label="Slug (gerado automaticamente)">
          <input
            className={adminInputClass() + " opacity-60"}
            value={form.slug}
            readOnly
          />
        </AdminField>
        <AdminField label="Descrição">
          <textarea
            className={adminInputClass() + " resize-none"}
            rows={2}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Ex: Realizou sua primeira compra na loja."
          />
        </AdminField>
        <AdminField label="Ícone">
          <div className="grid grid-cols-6 gap-2 mb-2">
            {ICONES.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setForm({ ...form, icone: ic })}
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                  form.icone === ic
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high hover:bg-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {ic}
                </span>
              </button>
            ))}
          </div>
        </AdminField>
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Tipo de Meta">
            <select
              className={adminInputClass()}
              value={form.meta_tipo}
              onChange={(e) => setForm({ ...form, meta_tipo: e.target.value })}
            >
              <option value="compras_count">Número de Compras</option>
              <option value="trocas_count">Número de Trocas</option>
              <option value="presentes_enviados">Presentes Enviados</option>
              <option value="presentes_resgatados">Presentes Resgatados</option>
              <option value="manual">Manual / Sistema Interno</option>
            </select>
          </AdminField>
          <AdminField label="Valor da Meta">
            <input
              type="number"
              min="1"
              className={adminInputClass()}
              value={form.meta_valor}
              onChange={(e) => setForm({ ...form, meta_valor: parseInt(e.target.value) || 1 })}
            />
          </AdminField>
        </div>
        <AdminField label="Bônus de Pontos">
          <input
            type="number"
            min="0"
            className={adminInputClass()}
            value={form.pontos_bonus}
            onChange={(e) => setForm({ ...form, pontos_bonus: parseInt(e.target.value) || 0 })}
          />
        </AdminField>
      </AdminFormModal>
    </AdminShell>
  );
}
