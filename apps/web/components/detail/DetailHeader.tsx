import { Compliance } from "../../types";
import { ComplianceBadge } from "../ui/ComplianceBadge";


export function DetailHeader({
  title,
  compliance,
  onBack,
  onEdit,
  onDeleteClick,
}: {
  title: string;
  compliance?: Compliance;
  onBack: () => void;
  onEdit?: () => void;
  onDeleteClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {typeof compliance !== "undefined" && (
          <div className="mt-1">
            <ComplianceBadge label={compliance} />
          </div>
        )}
      </div>

      <div className="ml-auto flex gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <span aria-hidden>✏️</span> Edit
          </button>
        )}
        {onDeleteClick && (
          <button
            type="button"
            onClick={onDeleteClick}
            className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <span aria-hidden>🗑️</span> Delete
          </button>
        )}
      </div>
    </div>
  );
}