import { Router } from 'express';
import * as ctrl from '../controllers/exception.controller';

const router = Router();

router.get('/', ctrl.list);
router.get('/simple', ctrl.simple);
router.get('/:id', ctrl.getById);
router.get('/:id/assignees', ctrl.listAssignees);
router.post('/:id/assign', ctrl.assign);
router.post('/:id/revoke', ctrl.revoke);

export default router;