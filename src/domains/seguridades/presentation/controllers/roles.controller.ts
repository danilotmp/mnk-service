import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RoleService } from '../../application/services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

/**
 * Controller de gestión de roles
 * Todos los endpoints requieren autenticación JWT
 */
@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiQuery({ name: 'companyId', required: false, description: 'ID de la empresa para filtrar', type: String })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(@Query('companyId') companyId?: string, @Request() req?: any) {
    const lang = req?.headers?.['accept-language'] || 'es';
    return this.roleService.findAll(companyId, lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.findOne(id, lang);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.create(createRoleDto, lang);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe o es un rol del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.update(id, updateRoleDto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un rol (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar un rol del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async remove(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.remove(id, lang);
  }
}

