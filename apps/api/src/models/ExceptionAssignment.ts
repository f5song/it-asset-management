import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface ExceptionAssignmentAttributes {
  assignment_id: number;
  exception_id: number;
  emp_code: string;
  status: 'active' | 'revoked';
  valid_from: Date | null;
  valid_to: Date | null;
  assigned_at: Date | null;
  assigned_by: string | null;
  revoked_at: Date | null;
  revoked_by: string | null;
  revoke_reason: string | null;
}

type ExceptionAssignmentCreation = Optional<
  ExceptionAssignmentAttributes,
  | 'assignment_id'
  | 'valid_from'
  | 'valid_to'
  | 'assigned_at'
  | 'assigned_by'
  | 'revoked_at'
  | 'revoked_by'
  | 'revoke_reason'
>;

export class ExceptionAssignment
  extends Model<ExceptionAssignmentAttributes, ExceptionAssignmentCreation>
  implements ExceptionAssignmentAttributes
{
  declare assignment_id: number;
  declare exception_id: number;
  declare emp_code: string;
  declare status: 'active' | 'revoked';
  declare valid_from: Date | null;
  declare valid_to: Date | null;
  declare assigned_at: Date | null;
  declare assigned_by: string | null;
  declare revoked_at: Date | null;
  declare revoked_by: string | null;
  declare revoke_reason: string | null;
}

ExceptionAssignment.init(
  {
    assignment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exception_id: { type: DataTypes.INTEGER, allowNull: false },
    emp_code: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'revoked'), allowNull: false, defaultValue: 'active' },
    valid_from: { type: DataTypes.DATE, allowNull: true },
    valid_to: { type: DataTypes.DATE, allowNull: true },
    assigned_at: { type: DataTypes.DATE, allowNull: true },
    assigned_by: { type: DataTypes.STRING, allowNull: true },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
    revoked_by: { type: DataTypes.STRING, allowNull: true },
    revoke_reason: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'exception_assignment',
    schema: 'public',
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['exception_id', 'emp_code', 'status'] },
      { fields: ['exception_id'] },
      { fields: ['emp_code'] },
      { fields: ['status'] },
    ],
  }
);