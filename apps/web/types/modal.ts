type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'date' | 'email' | 'url';

export type EditField = {
  /** key สำหรับผูกกับค่าของฟอร์ม */
  name: string;
  /** ป้ายชื่อที่แสดงบนฟอร์ม */
  label: string;
  /** ชนิด input */
  type?: FieldType;
  /** ข้อความกำกับ/คำอธิบายใต้ฟิลด์ */
  helpText?: string;
  /** placeholder */
  placeholder?: string;
  /** ฟิลด์นี้จำเป็นต้องกรอก */
  required?: boolean;
  /** สำหรับ select */
  options?: { label: string; value: string | number }[];
  /** ปิดการแก้ไข */
  disabled?: boolean;
  /** แสดงข้อผิดพลาดเฉพาะฟิลด์ (ถ้ามี) */
  error?: string;
};
