import { Compliance } from "./software";

export type DeviceItem = {
  id: string;            // Device ID
  name: string;          // Device Name
  type: "Laptop" | "Desktop" | "Mobile";
  assignedTo: string;    // Employee
  os: string;            // OS string เช่น Windows 11, macOS 14
  compliance: Compliance;
  lastScan: string;      // YYYY-MM-DD
};
