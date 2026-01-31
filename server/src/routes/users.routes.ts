import { Router } from 'express';
import { Container } from 'typedi';
import { UsersController } from '../controllers/users.controller';

const router = Router();
const usersController = Container.get(UsersController);

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

export default router;
