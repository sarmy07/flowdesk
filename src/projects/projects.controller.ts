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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/project/:organizationId')
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.create(
      createProjectDto,
      organizationId,
      user.id,
    );
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/project/:projectId')
  update(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(projectId, updateProjectDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.remove(id, user.id);
  }
}
