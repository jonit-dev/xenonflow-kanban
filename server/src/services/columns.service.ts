import { Service } from 'typedi';
import { ColumnsRepository } from '../repositories/columns.repository';
import { Column, CreateColumnDto, UpdateColumnDto } from '../types';

@Service()
export class ColumnsService {
  constructor(private columnsRepository: ColumnsRepository) {}

  getProjectColumns(projectId: string): Column[] {
    return this.columnsRepository.findByProjectId(projectId);
  }

  getColumn(id: string): Column | null {
    return this.columnsRepository.findById(id);
  }

  createColumn(dto: CreateColumnDto): Column {
    return this.columnsRepository.create(dto);
  }

  updateColumn(id: string, dto: UpdateColumnDto): Column | null {
    return this.columnsRepository.update(id, dto);
  }

  deleteColumn(id: string): boolean {
    return this.columnsRepository.delete(id);
  }
}
