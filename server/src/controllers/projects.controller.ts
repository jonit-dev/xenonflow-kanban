import { Service, Inject } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto, UpdateProjectDto } from '../types';

@Service()
export class ProjectsController {
  constructor(
    @Inject(() => ProjectsService)
    private projectsService: ProjectsService,
  ) {}

  getAll = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const projects = this.projectsService.getAll();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const project = this.projectsService.getById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  getByIdWithDetails = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const project = this.projectsService.getByIdWithDetails(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = req.body as CreateProjectDto;
      const project = this.projectsService.create(dto);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateProjectDto;
      const project = this.projectsService.update(id, dto);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.projectsService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
