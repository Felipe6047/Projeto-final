"use client";

export function AdminFormModal({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = "Salvar",
  loading,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div
        className="w-full max-w-lg bg-surface-container-low rounded-2xl p-6 premium-shadow border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="admin-modal-title"
      >
        <h2 id="admin-modal-title" className="text-headline-sm mb-4">
          {title}
        </h2>
        <div className="space-y-4">{children}</div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-outline-variant text-on-surface-variant"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container font-bold disabled:opacity-60"
          >
            {loading ? "Salvando..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="frik-label text-on-surface-variant block mb-2">{label}</label>
      {children}
    </div>
  );
}

export function adminInputClass() {
  return "w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-base border border-transparent focus:ring-2 focus:ring-primary/40";
}
