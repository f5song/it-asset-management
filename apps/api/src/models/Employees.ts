import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize";

export interface Employee07Attributes {
  emp_code: string;
  name_th: string | null;
  surname_th: string | null;
  department_name: string | null;
}

export class Employees
  extends Model<Employee07Attributes>
  implements Employee07Attributes
{
  declare emp_code: string;
  declare name_th: string | null;
  declare surname_th: string | null;
  declare department_name: string | null;
}

Employees.init(
  {
    emp_code: { type: DataTypes.STRING, primaryKey: true },
    name_th: { type: DataTypes.STRING, allowNull: true },
    surname_th: { type: DataTypes.STRING, allowNull: true },
    department_name: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: "07_employee",
    schema: "public",
    timestamps: false,
    underscored: true,
  },
);
