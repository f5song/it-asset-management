import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface ExceptionTicketMapAttributes {
  id: number;
  exception_id: number;
  ticket_id: number;
}

type ExceptionTicketMapCreation = Optional<ExceptionTicketMapAttributes, 'id'>;

export class ExceptionTicketMap
  extends Model<ExceptionTicketMapAttributes, ExceptionTicketMapCreation>
  implements ExceptionTicketMapAttributes
{
  declare id: number;
  declare exception_id: number;
  declare ticket_id: number;
}

ExceptionTicketMap.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exception_id: { type: DataTypes.INTEGER, allowNull: false },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'exception_ticket_map',
    schema: 'public',
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ['exception_id'] }],
  }
);