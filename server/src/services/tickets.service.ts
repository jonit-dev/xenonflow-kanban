import { Service, Inject } from 'typedi';
import { TicketsRepository } from '../repositories/tickets.repository';
import { ProjectsRepository } from '../repositories/projects.repository';
import { EpicsRepository } from '../repositories/epics.repository';
import { UsersRepository } from '../repositories/users.repository';
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketStatus,
  Ticket,
} from '../types';

@Service()
export class TicketsService {
  constructor(
    @Inject(() => TicketsRepository)
    private ticketsRepository: TicketsRepository,
    @Inject(() => ProjectsRepository)
    private projectsRepository: ProjectsRepository,
    @Inject(() => EpicsRepository)
    private epicsRepository: EpicsRepository,
    @Inject(() => UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  getByProjectId(projectId: string): Ticket[] {
    const project = this.projectsRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project with id "${projectId}" not found`);
    }

    return this.ticketsRepository.findByProjectId(projectId);
  }

  getById(id: string): Ticket | null {
    return this.ticketsRepository.findById(id);
  }

  create(dto: CreateTicketDto): Ticket {
    const project = this.projectsRepository.findById(dto.project_id);
    if (!project) {
      throw new Error(`Project with id "${dto.project_id}" not found`);
    }

    if (dto.epic_id) {
      const epic = this.epicsRepository.findById(dto.epic_id);
      if (!epic || epic.projectId !== dto.project_id) {
        throw new Error(`Epic with id "${dto.epic_id}" not found in this project`);
      }
    }

    if (dto.assignee_id) {
      const user = this.usersRepository.findById(dto.assignee_id);
      if (!user) {
        throw new Error(`User with id "${dto.assignee_id}" not found`);
      }
    }

    return this.ticketsRepository.create(dto);
  }

  update(id: string, dto: UpdateTicketDto): Ticket | null {
    const ticket = this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new Error(`Ticket with id "${id}" not found`);
    }

    if (dto.epic_id !== undefined) {
      if (dto.epic_id === null) {
        // Allow removing epic assignment
      } else {
        const epic = this.epicsRepository.findById(dto.epic_id);
        if (!epic || epic.projectId !== ticket.projectId) {
          throw new Error(`Epic with id "${dto.epic_id}" not found in this project`);
        }
      }
    }

    if (dto.assignee_id !== undefined && dto.assignee_id !== null) {
      const user = this.usersRepository.findById(dto.assignee_id);
      if (!user) {
        throw new Error(`User with id "${dto.assignee_id}" not found`);
      }
    }

    return this.ticketsRepository.update(id, dto);
  }

  updateStatus(id: string, status: TicketStatus): Ticket | null {
    const ticket = this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new Error(`Ticket with id "${id}" not found`);
    }

    return this.ticketsRepository.updateStatus(id, status);
  }

  delete(id: string): boolean {
    const ticket = this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new Error(`Ticket with id "${id}" not found`);
    }

    return this.ticketsRepository.delete(id);
  }
}
