import { Router } from 'express';
import { Container } from 'typedi';
import { EpicsController } from '../controllers/epics.controller';

const router = Router();
const epicsController = Container.get(EpicsController);

router.get('/project/:projectId', epicsController.getByProjectId);
router.get('/:id', epicsController.getById);
router.post('/', epicsController.create);
router.put('/:id', epicsController.update);
router.delete('/:id', epicsController.delete);

export default router;
