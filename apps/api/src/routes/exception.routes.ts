import { Router } from 'express';
import * as ctrl from '../controllers/exception.controller';
import { pagination1Based } from '../middlewares/pagination';

const router = Router();

router.get('/', pagination1Based(), ctrl.list);
router.get('/simple', ctrl.simple);
router.get('/:id', ctrl.getById);

/**
 *   รองรับ query:
 *   - status: 'active' | 'revoked' | 'any' (default = 'active')
 *   - page/pageSize มาจาก middleware pagination1Based()
 */
router.get('/:id/assignees', pagination1Based(), ctrl.listAssignees);

router.post('/:id/assign', ctrl.assign);
router.post('/:id/revoke', ctrl.revoke);

export default router;