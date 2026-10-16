import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/common/enums/user.role.enum';
import { StandardResponseDto } from 'src/shared/dto/output/standardResponseDto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    if (!user) {
      return new StandardResponseDto(
        'error',
        'error while fetching users',
        null,
      );
    }
    return new StandardResponseDto(
      'success',
      'users fetched successfully',
      user,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Get('backward-users')
  async updateUserWithUsername() {
    const users = await this.usersService.updateUserWithUsername();
    if (!users) {
      return new StandardResponseDto(
        'error',
        'error while updating users with username',
        null,
      );
    }

    return new StandardResponseDto(
      'success',
      'users username updated successfully',
      users,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return new StandardResponseDto(
        'error',
        'error while fetching user',
        null,
      );
    }
    return new StandardResponseDto(
      'success',
      'user fetched successfully',
      user,
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    if (!updatedUser) {
      return new StandardResponseDto('error', 'error updating user', null);
    }

    return new StandardResponseDto(
      'success',
      'user updated successfully',
      updatedUser,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);

    if (!user) {
      return new StandardResponseDto(
        'error',
        'error while removing user',
        null,
      );
    }
    return new StandardResponseDto(
      'success',
      'user removed successfully',
      user,
    );
  }
}
