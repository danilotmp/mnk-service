import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { UsuarioService } from '../../application/services/usuario.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

/**
 * Controller de gestión de usuarios
 * Todos los endpoints requieren autenticación JWT
 */
@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getCurrentUser(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.getProfile(req.user.userId, lang);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.findAll(lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.findOne(id, lang);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.create(createUsuarioDto, lang);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.update(id, updateUsuarioDto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async remove(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.remove(id, lang);
  }
}

