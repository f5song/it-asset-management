
import { ComplianceBadge } from "components/ui/ComplianceBadge";
import { BreadcrumbItem, Compliance } from "types";

export function DetailHeader({
  title,
  compliance,
  onBack,
  onEdit,
  onDeleteClick,
  breadcrumbs,
}: {
  title: string;
  compliance?: Compliance;
  onBack: () => void;
  onEdit?: () => void;
  onDeleteClick?: () => void;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>

        {/* แสดง Compliance (ถ้ามี) */}
        {typeof compliance !== "undefined" && (
          <div className="mt-1">
            <ComplianceBadge label={compliance} />
          </div>
        )}

        {/* แสดง Breadcrumbs (ถ้ามี) — แยกออกจาก compliance */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mt-2 text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              {breadcrumbs.map((bc, idx) => (
                <li key={idx} className="flex items-center">
                  {bc.href ? (
                    <a
                      href={bc.href}
                      className="hover:text-gray-700 underline-offset-2 hover:underline"
                    >
                      {bc.label}
                    </a>
                  ) : (
                    <span>{bc.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span className="mx-2 text-gray-400" aria-hidden="true">
                      ›
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
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
