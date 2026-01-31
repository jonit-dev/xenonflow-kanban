import { Service, Inject } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../types';

@Service()
export class UsersController {
  constructor(
    @Inject(() => UsersService)
    private usersService: UsersService,
  ) {}

  getAll = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const users = this.usersService.getAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const user = this.usersService.getById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = req.body as CreateUserDto;
      const user = this.usersService.create(dto);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateUserDto;
      const user = this.usersService.update(id, dto);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.usersService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
