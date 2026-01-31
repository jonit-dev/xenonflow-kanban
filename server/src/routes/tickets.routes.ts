import { Router } from 'express';
import { Container } from 'typedi';
import { TicketsController } from '../controllers/tickets.controller';

const router = Router();
const ticketsController = Container.get(TicketsController);

router.get('/project/:projectId', ticketsController.getByProjectId);
router.get('/:id', ticketsController.getById);
router.post('/', ticketsController.create);
router.put('/:id', ticketsController.update);
router.patch('/:id/status', ticketsController.updateStatus);
router.delete('/:id', ticketsController.delete);

export default router;
