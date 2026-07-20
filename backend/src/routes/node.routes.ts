import { Router } from 'express';
import { nodeController } from '../controllers/node.controller';

const router = Router();

router.get('/', nodeController.getAll);
router.get('/:id', nodeController.getById);
router.post('/', nodeController.create);
router.put('/:id', nodeController.update);
router.delete('/:id', nodeController.delete);

export default router;
