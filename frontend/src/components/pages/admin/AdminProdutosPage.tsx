"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import {
  adminCreateProduto,
  adminDeleteProduto,
  adminListProdutos,
  adminUpdateProduto,
  ProdutoAdmin,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const empty: ProdutoAdmin = {
  nome: "",
  preco_reais: 0,
  preco_pontos: 0,
  estoque: 0,
  ativo: true,
};

export function AdminProdutosPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<ProdutoAdmin[]>([]);
  const [form, setForm] = useState<ProdutoAdmin>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLista(await adminListProdutos());
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar produtos", "error"));
  }, [load, toast]);

  async function salvar() {
    setLoading(true);
    try {
      const body = { ...form, ativo: Boolean(form.ativo) };
      if (editId) {
        await adminUpdateProduto(editId, body);
        toast("Produto atualizado", "success");
      } else {
        await adminCreateProduto(body as Omit<ProdutoAdmin, "id">);
        toast("Produto criado", "success");
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
    <AdminShell title="Produtos" subtitle="Catálogo de presentes">
      <button
        type="button"
        onClick={() => {
          setForm(empty);
          setEditId(null);
          setOpen(true);
        }}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold"
      >
        Novo produto
      </button>
      <div className="space-y-3">
        {lista.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="font-bold">
                {p.nome}{" "}
                {!p.ativo && (
                  <span className="text-xs text-on-surface-variant">(inativo)</span>
                )}
              </p>
              <p className="text-sm text-on-surface-variant">
                R$ {Number(p.preco_reais).toFixed(2)} · {p.preco_pontos} pts · Estoque{" "}
                {p.estoque}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(p);
                  setEditId(p.id!);
                  setOpen(true);
                }}
                className="px-4 py-2 rounded-full border border-outline-variant text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Desativar produto?")) return;
                  await adminDeleteProduto(p.id!);
                  toast("Produto desativado", "success");
                  await load();
                }}
                className="px-4 py-2 rounded-full border border-error/50 text-error text-sm"
              >
                Desativar
              </button>
            </div>
          </div>
        ))}
      </div>
      <AdminFormModal
        open={open}
        title={editId ? "Editar produto" : "Novo produto"}
        onClose={() => setOpen(false)}
        onSubmit={salvar}
        loading={loading}
      >
        <AdminField label="Nome">
          <input
            className={adminInputClass()}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </AdminField>
        <AdminField label="Preço (R$)">
          <input
            type="number"
            step="0.01"
            className={adminInputClass()}
            value={form.preco_reais}
            onChange={(e) =>
              setForm({ ...form, preco_reais: Number(e.target.value) })
            }
          />
        </AdminField>
        <AdminField label="Preço (pontos)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.preco_pontos}
            onChange={(e) =>
              setForm({ ...form, preco_pontos: Number(e.target.value) })
            }
          />
        </AdminField>
        <AdminField label="Estoque">
          <input
            type="number"
            className={adminInputClass()}
            value={form.estoque ?? 0}
            onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })}
          />
        </AdminField>
      </AdminFormModal>
    </AdminShell>
  );
}
