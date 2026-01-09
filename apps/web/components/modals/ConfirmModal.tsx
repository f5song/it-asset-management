'use client';
export function ConfirmModal({
  title,
  description,
  open,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}