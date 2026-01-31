import { Router } from 'express';
import { Container } from 'typedi';
import { EpicsController } from '../controllers/epics.controller';

const router = Router();
const epicsController = Container.get(EpicsController);

router.get('/project/:projectId', (req, res, next) => epicsController.getByProjectId(req, res, next));
router.get('/:id', (req, res, next) => epicsController.getById(req, res, next));
router.post('/', (req, res, next) => epicsController.create(req, res, next));
router.put('/:id', (req, res, next) => epicsController.update(req, res, next));
router.delete('/:id', (req, res, next) => epicsController.delete(req, res, next));

export default router;
