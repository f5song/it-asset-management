import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ExceptionListAttributes {
  exception_id: number;
  code: string;
  name: string;
  risk_level: RiskLevel;
  category_id: number | null;
  is_active: boolean;
  created_at: Date;
}

type ExceptionListCreation = Optional<ExceptionListAttributes, 'exception_id' | 'created_at'>;

export class ExceptionList
  extends Model<ExceptionListAttributes, ExceptionListCreation>
  implements ExceptionListAttributes
{
  declare exception_id: number;
  declare code: string;
  declare name: string;
  declare risk_level: RiskLevel;
  declare category_id: number | null;
  declare is_active: boolean;
  declare created_at: Date;
}

ExceptionList.init(
  {
    exception_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    risk_level: { type: DataTypes.ENUM('Low', 'Medium', 'High'), allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('now()') },
  },
  {
    sequelize,
    tableName: 'exception_list',
    schema: 'public',
    timestamps: false,
    underscored: true,
  }
);