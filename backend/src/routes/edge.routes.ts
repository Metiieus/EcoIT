import { Router } from 'express';
import { edgeController } from '../controllers/edge.controller';

const router = Router();

router.get('/', edgeController.getAll);
router.post('/', edgeController.create);
router.delete('/:id', edgeController.delete);

export default router;
