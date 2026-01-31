import { Service, Inject } from 'typedi';
import { EpicsRepository } from '../repositories/epics.repository';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CreateEpicDto, UpdateEpicDto, Epic } from '../types';

@Service()
export class EpicsService {
  constructor(
    @Inject(() => EpicsRepository)
    private epicsRepository: EpicsRepository,
    @Inject(() => ProjectsRepository)
    private projectsRepository: ProjectsRepository,
  ) {}

  getByProjectId(projectId: string): Epic[] {
    const project = this.projectsRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project with id "${projectId}" not found`);
    }

    return this.epicsRepository.findByProjectId(projectId);
  }

  getById(id: string): Epic | null {
    return this.epicsRepository.findById(id);
  }

  create(dto: CreateEpicDto): Epic {
    const project = this.projectsRepository.findById(dto.project_id);
    if (!project) {
      throw new Error(`Project with id "${dto.project_id}" not found`);
    }

    return this.epicsRepository.create(dto);
  }

  update(id: string, dto: UpdateEpicDto): Epic | null {
    const epic = this.epicsRepository.findById(id);
    if (!epic) {
      throw new Error(`Epic with id "${id}" not found`);
    }

    return this.epicsRepository.update(id, dto);
  }

  delete(id: string): boolean {
    const epic = this.epicsRepository.findById(id);
    if (!epic) {
      throw new Error(`Epic with id "${id}" not found`);
    }

    return this.epicsRepository.delete(id);
  }
}
