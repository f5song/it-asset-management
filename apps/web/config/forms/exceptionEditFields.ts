// src/app/config/forms/exceptionEditFields.ts
import type { FormField } from "types/forms";
import type { PolicyStatus, RiskLevel } from "types/exception";

const STATUS_OPTIONS = (["Active", "Inactive"] as PolicyStatus[])
  .map(v => ({ label: v, value: v }));

const RISK_OPTIONS = (["Low", "Medium", "High"] as RiskLevel[])
  .map(v => ({ label: v, value: v }));

export const exceptionEditFields = [
  // text
  { name: "name",        label: "Name",         type: "text",     required: true },
  { name: "status",      label: "Status",       type: "select",   options: STATUS_OPTIONS },
  { name: "risk",        label: "Risk",         type: "select",   options: RISK_OPTIONS },

  // datetime
  { name: "createdAt",   label: "Created At",   type: "datetime" },
  { name: "lastUpdated", label: "Last Updated", type: "datetime" },

  // textarea
  { name: "notes",       label: "Notes",        type: "textarea" },
] satisfies readonly FormField<
  | "name"
  | "status"
  | "risk"
  | "createdAt"
  | "lastUpdated"
  | "notes"
>[];