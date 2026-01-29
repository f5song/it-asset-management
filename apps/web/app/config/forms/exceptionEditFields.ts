// src/app/config/forms/exceptionEditFields.ts
import type { FormField } from "types/forms";
import type { ExceptionCategory, PolicyStatus, RiskLevel } from "types/exception";

// options สำหรับ select
const CATEGORY_OPTIONS = (["AI", "USBDrive", "MessagingApp", "ADPasswordPolicy"] as ExceptionCategory[])
  .map(v => ({ label: v, value: v }));

const STATUS_OPTIONS = (["Active", "Inactive", "Deprecated", "Archived"] as PolicyStatus[])
  .map(v => ({ label: v, value: v }));

const RISK_OPTIONS = (["Low", "Medium", "High"] as RiskLevel[])
  .map(v => ({ label: v, value: v }));

export const exceptionEditFields = [
  // text
  { name: "name",        label: "Name",         type: "text",     required: true },

  // select
  { name: "category",    label: "Category",     type: "select",   options: CATEGORY_OPTIONS },
  { name: "status",      label: "Status",       type: "select",   options: STATUS_OPTIONS },
  { name: "risk",        label: "Risk",         type: "select",   options: RISK_OPTIONS },

  // text
  { name: "owner",       label: "Owner",        type: "text" },

  // datetime
  { name: "createdAt",   label: "Created At",   type: "datetime" },
  { name: "lastUpdated", label: "Last Updated", type: "datetime" },
  { name: "reviewAt",    label: "Review At",    type: "datetime" },

  // textarea
  { name: "notes",       label: "Notes",        type: "textarea" },
] satisfies readonly FormField<
  | "name"
  | "category"
  | "status"
  | "risk"
  | "owner"
  | "createdAt"
  | "lastUpdated"
  | "reviewAt"
  | "notes"
>[];