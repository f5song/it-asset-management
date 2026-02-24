// src/routes/employee.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/employee.controller';
import { pagination1Based } from '../middlewares/pagination';

const router = Router();

//   รับ 1‑based: /employees?page=1&pageSize=10&...
router.get('/', pagination1Based(), ctrl.list);
router.get('/:id', ctrl.getById);

export default router;
