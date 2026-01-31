import { Router } from 'express';
import { Container } from 'typedi';
import { ProjectsController } from '../controllers/projects.controller';

const router = Router();
const projectsController = Container.get(ProjectsController);

router.get('/', (req, res, next) => projectsController.getAll(req, res, next));
// More specific routes must come first
router.get('/:id/details', (req, res, next) => projectsController.getByIdWithDetails(req, res, next));
router.get('/:id', (req, res, next) => projectsController.getById(req, res, next));
router.post('/', (req, res, next) => projectsController.create(req, res, next));
router.put('/:id', (req, res, next) => projectsController.update(req, res, next));
router.delete('/:id', (req, res, next) => projectsController.delete(req, res, next));

export default router;
