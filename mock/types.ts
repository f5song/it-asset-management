export type LicenseAction =
  | "Assign"
  | "Deallocate"
  | "Request Approved"
  | "Request Rejected";

export type LicenseActivity = {
  date: string | Date;     // วันที่ (สามารถเป็น Date หรือ string)
  action: LicenseAction;   // การกระทำ
  software: string;        // ชื่อซอฟต์แวร์
  employee: string;        // ชื่อพนักงาน
};

export type ItemStatus = 'Active' | 'Expired' | 'Expiring';
export type PolicyCompliance = 'Allowed' | 'Not Allowed';
export type SoftwareType = 'Standard' | 'Special' | 'Exception';
export type LicenseModel = 'Free' | 'Paid' | 'Perpetual' | 'Subscription';
export type ClientServer = 'Client' | 'Server';