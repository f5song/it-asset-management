import { sequelize } from '../config/sequelize';
import { ExceptionList } from './ExceptionList';
import { ExceptionAssignment } from './ExceptionAssignment';
import { ExceptionTicketMap } from './ExceptionTicketMap';
import { Employees } from './Employees';

// Associations
ExceptionAssignment.belongsTo(ExceptionList, { foreignKey: 'exception_id', as: 'exception' });
ExceptionList.hasMany(ExceptionAssignment, { foreignKey: 'exception_id', as: 'assignments' });

ExceptionTicketMap.belongsTo(ExceptionList, { foreignKey: 'exception_id', as: 'exception' });
ExceptionList.hasMany(ExceptionTicketMap, { foreignKey: 'exception_id', as: 'ticketMaps' });

ExceptionAssignment.belongsTo(Employees, { foreignKey: 'emp_code', targetKey: 'emp_code', as: 'employee' });

export {
  sequelize,
  ExceptionList,
  ExceptionAssignment,
  ExceptionTicketMap,
  Employees,
};