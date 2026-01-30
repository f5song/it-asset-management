// src/components/toolbar/Toolbar.types.ts

export type ButtonVariant = 'primary' | 'secondary';

export type BaseControl = {
  /** unique id สำหรับใช้เป็น key */
  id: string;
};

export type SelectControl = BaseControl & {
  kind: 'select';
  /** ป้ายกำกับหน้าช่อง select (optional) */
  label?: string;
  /** ค่าใน select ปัจจุบัน */
  value: string;
  /** trigger เมื่อค่าเปลี่ยน */
  onChange: (value: string) => void;
  /**
   * รายการตัวเลือกใน select
   * หมายเหตุ: เพื่อให้เข้ากับโค้ดปัจจุบันใน Toolbar.tsx
   * ซึ่ง render <option key={`${c.id}-${opt}`}>{opt}</option>
   * จึงกำหนดให้เป็น string[] (หากต้องการ label/value object
   * ต้องแก้โค้ด component เพิ่มเติม)
   */
  options: string[];
};

export type SearchControl = BaseControl & {
  kind: 'search';
  /** ค่าในกล่องค้นหา */
  value: string;
  /** placeholder ใน input */
  placeholder?: string;
  /** trigger เมื่อค่าค้นหาเปลี่ยน */
  onChange: (value: string) => void;
};

export type ButtonControl = BaseControl & {
  kind: 'button';
  /** ป้ายบนปุ่ม */
  label: string;
  /** สไตล์ของปุ่ม */
  variant?: ButtonVariant;
  /** trigger เมื่อ click */
  onClick: () => void;
};

/** union ของ control ที่รองรับทั้งหมด */
export type ToolbarControl = SelectControl | SearchControl | ButtonControl;
