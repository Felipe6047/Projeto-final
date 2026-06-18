"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import {
  adminCreateCupomTemplate,
  adminDeleteCupomTemplate,
  adminListCupomTemplates,
  adminUpdateCupomTemplate,
  CupomTemplateAdmin,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const CATEGORIAS = ["Eletrônicos", "Moda", "Bem-estar", "Gastronomia", "Entretenimento", "Acessórios", "Games", "Geral", "Frete", "Outros"];

const empty: CupomTemplateAdmin = {
  titulo: "",
  descricao: "",
  categoria: "Geral",
  dias_validade: 30,
  preco_pontos: 0,
  ativo: true,
};

export function AdminCuponsPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<CupomTemplateAdmin[]>([]);
  const [form, setForm] = useState<CupomTemplateAdmin>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLista(await adminListCupomTemplates());
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar templates", "error"));
  }, [load, toast]);

  async function salvar() {
    setLoading(true);
    try {
      const body = { ...form, ativo: Boolean(form.ativo) };
      if (editId) {
        await adminUpdateCupomTemplate(editId, body);
        toast("Template atualizado", "success");
      } else {
        await adminCreateCupomTemplate(body as Omit<CupomTemplateAdmin, "id">);
        toast("Template criado", "success");
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
    <AdminShell title="Templates de cupom" subtitle="Modelos para emissão de cupons">
      <button
        type="button"
        onClick={() => {
          setForm(empty);
          setEditId(null);
          setOpen(true);
        }}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold"
      >
        Novo template
      </button>
      <div className="space-y-3">
        {lista.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="font-bold">{c.titulo}</p>
              <p className="text-sm text-on-surface-variant">
                {c.categoria}
                {c.desconto_percentual != null && ` · ${c.desconto_percentual}% off`}
                {c.desconto_valor != null && ` · R$ ${c.desconto_valor}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(c);
                  setEditId(c.id!);
                  setOpen(true);
                }}
                className="px-4 py-2 rounded-full border border-outline-variant text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Excluir template?")) return;
                  await adminDeleteCupomTemplate(c.id!);
                  toast("Removido", "success");
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
        title={editId ? "Editar template" : "Novo template"}
        onClose={() => setOpen(false)}
        onSubmit={salvar}
        loading={loading}
      >
        <AdminField label="Título *">
          <input
            className={adminInputClass()}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: 15% de desconto na próxima compra"
          />
        </AdminField>
        <AdminField label="Descrição">
          <textarea
            className={adminInputClass() + " resize-none"}
            rows={2}
            value={form.descricao ?? ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Breve descrição do cupom..."
          />
        </AdminField>
        <AdminField label="Categoria">
          <select
            className={adminInputClass()}
            value={form.categoria || "Geral"}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Custo em Pontos (para resgate)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.preco_pontos ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                preco_pontos: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Ex: 500"
          />
        </AdminField>
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Desconto %">
            <input
              type="number"
              className={adminInputClass()}
              value={form.desconto_percentual ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  desconto_percentual: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </AdminField>
          <AdminField label="Desconto R$">
            <input
              type="number"
              className={adminInputClass()}
              value={form.desconto_valor ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  desconto_valor: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </AdminField>
        </div>
        <AdminField label="Validade (dias)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.dias_validade ?? 30}
            onChange={(e) =>
              setForm({ ...form, dias_validade: Number(e.target.value) })
            }
          />
        </AdminField>
        <AdminField label="Limite por usuário (Opcional)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.limite_por_usuario ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                limite_por_usuario: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </AdminField>
        <AdminField label="Estoque global (Opcional)">
          <input
            type="number"
            className={adminInputClass()}
            value={form.limite_total ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                limite_total: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </AdminField>
      </AdminFormModal>
    </AdminShell>
  );
}
