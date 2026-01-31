import { Router } from 'express';
import { Container } from 'typedi';
import { UsersController } from '../controllers/users.controller';

const router = Router();
const usersController = Container.get(UsersController);

router.get('/', (req, res, next) => usersController.getAll(req, res, next));
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));
router.post('/', (req, res, next) => usersController.create(req, res, next));
router.put('/:id', (req, res, next) => usersController.update(req, res, next));
router.delete('/:id', (req, res, next) => usersController.delete(req, res, next));

export default router;
