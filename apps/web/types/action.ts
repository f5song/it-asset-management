import { ToolbarAction } from "./tab";

/** ฟังก์ชันคำนวณ path จาก action + selectedIds */
export type ActionPathBuilder = (args: {
  action: ToolbarAction;
  selectedIds: string[];
}) => string | undefined;

/** กำหนดได้ทั้ง string ตายตัว หรือฟังก์ชันคำนวณ path */
export type ActionPathConfig = string | ActionPathBuilder;