import { Service, Inject } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { EpicsService } from '../services/epics.service';
import { CreateEpicDto, UpdateEpicDto } from '../types';

@Service()
export class EpicsController {
  constructor(
    @Inject(() => EpicsService)
    private epicsService: EpicsService,
  ) {}

  getByProjectId = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { projectId } = req.params;
      const epics = this.epicsService.getByProjectId(projectId);
      res.json(epics);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const epic = this.epicsService.getById(id);
      if (!epic) {
        res.status(404).json({ error: 'Epic not found' });
        return;
      }
      res.json(epic);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = req.body as CreateEpicDto;
      const epic = this.epicsService.create(dto);
      res.status(201).json(epic);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateEpicDto;
      const epic = this.epicsService.update(id, dto);
      if (!epic) {
        res.status(404).json({ error: 'Epic not found' });
        return;
      }
      res.json(epic);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.epicsService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
