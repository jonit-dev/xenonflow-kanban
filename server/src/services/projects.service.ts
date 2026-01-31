import { Service, Inject } from 'typedi';
import { ProjectsRepository } from '../repositories/projects.repository';
import { EpicsRepository } from '../repositories/epics.repository';
import { TicketsRepository } from '../repositories/tickets.repository';
import { CreateProjectDto, UpdateProjectDto, Project, ProjectWithDetails } from '../types';

@Service()
export class ProjectsService {
  constructor(
    @Inject(() => ProjectsRepository)
    private projectsRepository: ProjectsRepository,
    @Inject(() => EpicsRepository)
    private epicsRepository: EpicsRepository,
    @Inject(() => TicketsRepository)
    private ticketsRepository: TicketsRepository,
  ) {}

  getAll(): Project[] {
    return this.projectsRepository.findAll();
  }

  getById(id: string): Project | null {
    return this.projectsRepository.findById(id);
  }

  getByIdWithDetails(id: string): ProjectWithDetails | null {
    const project = this.projectsRepository.findById(id);
    if (!project) return null;

    const epics = this.epicsRepository.findByProjectId(id);
    const tickets = this.ticketsRepository.findByProjectId(id);

    return {
      ...project,
      epics,
      tickets,
    };
  }

  create(dto: CreateProjectDto): Project {
    return this.projectsRepository.create(dto);
  }

  update(id: string, dto: UpdateProjectDto): Project | null {
    const project = this.projectsRepository.findById(id);
    if (!project) {
      throw new Error(`Project with id "${id}" not found`);
    }

    return this.projectsRepository.update(id, dto);
  }

  delete(id: string): boolean {
    const project = this.projectsRepository.findById(id);
    if (!project) {
      throw new Error(`Project with id "${id}" not found`);
    }

    return this.projectsRepository.delete(id);
  }
}
