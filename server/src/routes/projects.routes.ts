import { Router } from 'express';
import { Container } from 'typedi';
import { ProjectsController } from '../controllers/projects.controller';

const router = Router();
const projectsController = Container.get(ProjectsController);

router.get('/', projectsController.getAll);
router.get('/:id', projectsController.getById);
router.get('/:id/details', projectsController.getByIdWithDetails);
router.post('/', projectsController.create);
router.put('/:id', projectsController.update);
router.delete('/:id', projectsController.delete);

export default router;
