import { Service, Inject } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto, UpdateTicketDto, TicketStatus } from '../types';

@Service()
export class TicketsController {
  constructor(
    @Inject(() => TicketsService)
    private ticketsService: TicketsService,
  ) {}

  getByProjectId = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { projectId } = req.params;
      const tickets = this.ticketsService.getByProjectId(projectId);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const ticket = this.ticketsService.getById(id);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = req.body as CreateTicketDto;
      const ticket = this.ticketsService.create(dto);
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateTicketDto;
      const ticket = this.ticketsService.update(id, dto);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      const ticket = this.ticketsService.updateStatus(id, status as TicketStatus);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.ticketsService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
