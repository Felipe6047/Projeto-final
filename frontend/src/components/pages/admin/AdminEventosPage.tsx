"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminField,
  AdminFormModal,
  adminInputClass,
} from "@/components/admin/AdminFormModal";
import {
  adminCreateEvento,
  adminDeleteEvento,
  adminListEventos,
  adminUpdateEvento,
  EventoAdmin,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const empty: EventoAdmin = {
  titulo: "",
  trocas_extras: 2,
  inicio_em: "",
  fim_em: "",
  ativo: true,
};

export function AdminEventosPage() {
  const { toast } = useToast();
  const [lista, setLista] = useState<EventoAdmin[]>([]);
  const [form, setForm] = useState<EventoAdmin>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLista(await adminListEventos());
  }, []);

  useEffect(() => {
    load().catch(() => toast("Erro ao carregar eventos", "error"));
  }, [load, toast]);

  async function salvar() {
    setLoading(true);
    try {
      const body = {
        ...form,
        ativo: Boolean(form.ativo),
        inicio_em: new Date(form.inicio_em).toISOString(),
        fim_em: new Date(form.fim_em).toISOString(),
      };
      if (editId) {
        await adminUpdateEvento(editId, body);
        toast("Evento atualizado", "success");
      } else {
        await adminCreateEvento(body as Omit<EventoAdmin, "id">);
        toast("Evento criado", "success");
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
    <AdminShell title="Eventos sazonais" subtitle="Bônus temporários no programa">
      <button
        type="button"
        onClick={() => {
          setForm({
            ...empty,
            inicio_em: new Date().toISOString().slice(0, 16),
            fim_em: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
          });
          setEditId(null);
          setOpen(true);
        }}
        className="mb-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold"
      >
        Novo evento
      </button>
      <div className="space-y-3">
        {lista.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="font-bold">{e.titulo}</p>
              <p className="text-sm text-on-surface-variant">
                +{e.trocas_extras} trocas · até{" "}
                {new Date(e.fim_em).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...e,
                    inicio_em: String(e.inicio_em).slice(0, 16),
                    fim_em: String(e.fim_em).slice(0, 16),
                  });
                  setEditId(e.id!);
                  setOpen(true);
                }}
                className="px-4 py-2 rounded-full border border-outline-variant text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Excluir evento?")) return;
                  await adminDeleteEvento(e.id!);
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
        title={editId ? "Editar evento" : "Novo evento"}
        onClose={() => setOpen(false)}
        onSubmit={salvar}
        loading={loading}
      >
        <AdminField label="Título">
          <input
            className={adminInputClass()}
            value={form.titulo}
            onChange={(ev) => setForm({ ...form, titulo: ev.target.value })}
          />
        </AdminField>
        <AdminField label="Trocas extras">
          <input
            type="number"
            className={adminInputClass()}
            value={form.trocas_extras ?? 0}
            onChange={(ev) =>
              setForm({ ...form, trocas_extras: Number(ev.target.value) })
            }
          />
        </AdminField>
        <AdminField label="Início">
          <input
            type="datetime-local"
            className={adminInputClass()}
            value={form.inicio_em}
            onChange={(ev) => setForm({ ...form, inicio_em: ev.target.value })}
          />
        </AdminField>
        <AdminField label="Fim">
          <input
            type="datetime-local"
            className={adminInputClass()}
            value={form.fim_em}
            onChange={(ev) => setForm({ ...form, fim_em: ev.target.value })}
          />
        </AdminField>
      </AdminFormModal>
    </AdminShell>
  );
}
