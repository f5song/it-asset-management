
// src/types/actions.ts

/** Toolbar actions (รวมเป็นที่เดียว) */
export type ToolbarAction = "Delete" | "Reassign" | "Add" | "Assign Exceptions" | "Assign License" | "Edit";

/** ฟังก์ชันคำนวณ path จาก action + selectedIds */
export type ActionPathBuilder = (args: {
  action: ToolbarAction;
  selectedIds: string[]; 
}) => string | undefined;

/** กำหนดได้ทั้ง string ตายตัว หรือฟังก์ชันคำนวณ path */
export type ActionPathConfig = string | ActionPathBuilder;

