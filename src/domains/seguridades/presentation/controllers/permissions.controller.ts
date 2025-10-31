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
import { PermissionService } from '../../application/services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionType } from '../../infrastructure/entities/permission.entity';

/**
 * Controller de gestión de permisos
 * Todos los endpoints requieren autenticación JWT
 */
@ApiTags('Permisos')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PermissionType,
    description: 'Tipo de permiso para filtrar (PAGE o ACTION)',
  })
  @ApiResponse({ status: 200, description: 'Lista de permisos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(@Query('type') type?: PermissionType, @Request() req?: any) {
    const lang = req?.headers?.['accept-language'] || 'es';
    return this.permissionService.findAll(type, lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.findOne(id, lang);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El código del permiso ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async create(@Body() createPermissionDto: CreatePermissionDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.create(createPermissionDto, lang);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede modificar un permiso del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.update(id, updatePermissionDto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un permiso (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar un permiso del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async remove(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.remove(id, lang);
  }
}

