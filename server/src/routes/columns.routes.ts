import { Router } from 'express';
import { Container } from 'typedi';
import { ColumnsController } from '../controllers/columns.controller';

const router = Router();
const columnsController = Container.get(ColumnsController);

router.get('/project/:projectId', (req, res, next) => columnsController.getProjectColumns(req, res, next));
router.post('/', (req, res, next) => columnsController.create(req, res, next));
router.put('/:id', (req, res, next) => columnsController.update(req, res, next));
router.delete('/:id', (req, res, next) => columnsController.delete(req, res, next));

export default router;
