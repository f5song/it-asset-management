// employees.routes.ts
import { Router } from 'express';
import { searchEmployees } from './employees.controller';

export const employeesRouter = Router();

employeesRouter.get('/', searchEmployees);