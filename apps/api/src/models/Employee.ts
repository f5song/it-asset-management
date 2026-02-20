// src/models/Employee.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/sequelize";

/**
 * ให้ type สะท้อน DDL:
 * - sex, emp_stus: NOT NULL -> string (ต้องมี)
 * - อื่น ๆ: อนุญาต null ได้
 * - emp_type: CHAR(1) -> string | null
 */
export interface EmployeeAttributes {
  emp_code: string;                 // PK, NOT NULL
  name_th: string | null;
  surname_th: string | null;
  name_eng: string | null;
  surname_eng: string | null;
  company_name: string | null;
  department_name: string | null;
  section_name: string | null;
  unit_name: string | null;
  posi_name_th: string | null;
  sex: string;                      // NOT NULL, CHAR(1)
  birthday: Date | null;
  e_mail: string | null;
  work_phone_in: string | null;
  ebegin_date: Date | null;
  resign_date: Date | null;
  emp_stus: string;                 // NOT NULL, CHAR(1)
  update_time: Date | null;
  emp_type: string | null;          // CHAR(1), nullable
}

/**
 * สำหรับการสร้าง record ใหม่:
 * - บังคับเฉพาะฟิลด์ที่ NOT NULL/PK (emp_code, sex, emp_stus)
 * - ฟิลด์ที่เหลือ optional
 */
type EmployeeCreationAttributes = Optional<
  EmployeeAttributes,
  | "name_th"
  | "surname_th"
  | "name_eng"
  | "surname_eng"
  | "company_name"
  | "department_name"
  | "section_name"
  | "unit_name"
  | "posi_name_th"
  | "birthday"
  | "e_mail"
  | "work_phone_in"
  | "ebegin_date"
  | "resign_date"
  | "update_time"
  | "emp_type"
>;

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public emp_code!: string;
  public name_th!: string | null;
  public surname_th!: string | null;
  public name_eng!: string | null;
  public surname_eng!: string | null;
  public company_name!: string | null;
  public department_name!: string | null;
  public section_name!: string | null;
  public unit_name!: string | null;
  public posi_name_th!: string | null;
  public sex!: string; // CHAR(1)
  public birthday!: Date | null;
  public e_mail!: string | null;
  public work_phone_in!: string | null;
  public ebegin_date!: Date | null;
  public resign_date!: Date | null;
  public emp_stus!: string; // CHAR(1)
  public update_time!: Date | null;
  public emp_type!: string | null; // CHAR(1), nullable
}

Employee.init(
  {
    emp_code: {
      type: DataTypes.STRING(6),
      primaryKey: true,
      allowNull: false,
    },
    name_th: { type: DataTypes.STRING(200), allowNull: true },
    surname_th: { type: DataTypes.STRING(200), allowNull: true },
    name_eng: { type: DataTypes.STRING(200), allowNull: true },
    surname_eng: { type: DataTypes.STRING(200), allowNull: true },
    company_name: { type: DataTypes.STRING(200), allowNull: true },
    department_name: { type: DataTypes.STRING(200), allowNull: true },
    section_name: { type: DataTypes.STRING(200), allowNull: true },
    unit_name: { type: DataTypes.STRING(200), allowNull: true },
    posi_name_th: { type: DataTypes.STRING(200), allowNull: true },

    sex: { type: DataTypes.CHAR(1), allowNull: false },           // 'M' | 'F' | etc.

    birthday: { type: DataTypes.DATEONLY, allowNull: true },
    e_mail: { type: DataTypes.STRING(200), allowNull: true },
    work_phone_in: { type: DataTypes.STRING(50), allowNull: true },

    ebegin_date: { type: DataTypes.DATEONLY, allowNull: true },
    resign_date: { type: DataTypes.DATEONLY, allowNull: true },

    emp_stus: { type: DataTypes.CHAR(1), allowNull: false },      // 'A' | 'R' | etc.
    update_time: { type: DataTypes.DATEONLY, allowNull: true },

    // ✅ ตรงกับ DDL: emp_type เป็น CHAR(1) และอนุญาต NULL
    emp_type: { type: DataTypes.CHAR(1), allowNull: true },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: '07_employee',
    schema: "public",
    timestamps: false,
    underscored: false,
    // (ทางเลือก) เปิดการ quote identifier เสมอหากต้องการความชัวร์กับชื่อขึ้นต้นตัวเลข
    // freezeTableName: true,
  }
);
``