import { Router } from 'express';
import { Container } from 'typedi';
import { TicketsController } from '../controllers/tickets.controller';

const router = Router();
const ticketsController = Container.get(TicketsController);

router.get('/project/:projectId', (req, res, next) => ticketsController.getByProjectId(req, res, next));
router.get('/:id', (req, res, next) => ticketsController.getById(req, res, next));
router.post('/', (req, res, next) => ticketsController.create(req, res, next));
router.put('/:id', (req, res, next) => ticketsController.update(req, res, next));
router.patch('/:id/status', (req, res, next) => ticketsController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => ticketsController.delete(req, res, next));

export default router;
