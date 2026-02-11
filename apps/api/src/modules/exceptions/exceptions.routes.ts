import { Router } from 'express';
import {
  getExceptions,
  getException,
  getExceptionAssignees,
  postAssign,
  postRevoke
} from './exceptions.controller';

export const exceptionsRouter = Router();

// List + search + pagination + sorting
exceptionsRouter.get('/', getExceptions);

// Detail
exceptionsRouter.get('/:id', getException);

// Assignees (tab)
exceptionsRouter.get('/:id/assignees', getExceptionAssignees);

// Assign to employees (multiple)
exceptionsRouter.post('/:id/assign', postAssign);

// Revoke assignments (multiple)
exceptionsRouter.post('/:id/revoke', postRevoke);