import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find({
      relations: {
        memberships: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        memberships: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        memberships: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException();

    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
