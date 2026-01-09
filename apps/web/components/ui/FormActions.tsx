
// src/components/ui/FormActions.tsx
import React from "react";

export const FormActions: React.FC<{
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}> = ({ submitLabel = "Submit", cancelLabel = "Cancel", onCancel }) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {submitLabel}
      </button>
    </div>
  );
};
