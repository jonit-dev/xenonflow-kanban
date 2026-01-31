import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { ColumnsService } from '../services/columns.service';
import { CreateColumnDto, UpdateColumnDto } from '../types';

@Service()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  getProjectColumns = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { projectId } = req.params;
      const columns = this.columnsService.getProjectColumns(projectId);
      res.json(columns);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto: CreateColumnDto = req.body;
      if (!dto.project_id || !dto.title || !dto.status_key) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      const column = this.columnsService.createColumn(dto);
      res.status(201).json(column);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const dto: UpdateColumnDto = req.body;
      const column = this.columnsService.updateColumn(id, dto);
      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }
      res.json(column);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const success = this.columnsService.deleteColumn(id);
      if (!success) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
