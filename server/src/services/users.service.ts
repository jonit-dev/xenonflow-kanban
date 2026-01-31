import { Service, Inject } from 'typedi';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, User } from '../types';

@Service()
export class UsersService {
  constructor(
    @Inject(() => UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  getAll(): User[] {
    return this.usersRepository.findAll();
  }

  getById(id: string): User | null {
    return this.usersRepository.findById(id);
  }

  create(dto: CreateUserDto): User {
    // Check if username already exists
    const existingByUsername = this.usersRepository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new Error(`Username "${dto.username}" already exists`);
    }

    return this.usersRepository.create(dto);
  }

  update(id: string, dto: UpdateUserDto): User | null {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw new Error(`User with id "${id}" not found`);
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      const existingByUsername = this.usersRepository.findByUsername(dto.username);
      if (existingByUsername && existingByUsername.id !== id) {
        throw new Error(`Username "${dto.username}" already exists`);
      }
    }

    return this.usersRepository.update(id, dto);
  }

  delete(id: string): boolean {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw new Error(`User with id "${id}" not found`);
    }

    return this.usersRepository.delete(id);
  }
}
