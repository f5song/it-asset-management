
// src/components/toolbar/Toolbar.types.ts
export type ToolbarControl =
  | {
      kind: 'select';
      id: string;
      label?: string;
      options: string[];
      value: string;
      onChange: (v: string) => void;
    }
  | {
    kind: 'search';
    id: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
  }
  | {
    kind: 'button';
    id: string;
    label: string;
    variant?: 'primary' | 'secondary';
    onClick: () => void;
  };

export interface ToolbarProps {
  controls: ToolbarControl[];
  className?: string;
}
