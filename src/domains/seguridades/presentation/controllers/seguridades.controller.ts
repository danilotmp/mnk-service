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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { UsuarioService } from '../../application/services/usuario.service';
import { RoleService } from '../../application/services/role.service';
import { PermissionService } from '../../application/services/permission.service';
import { MenuService } from '../../application/services/menu.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageService } from '@/common/messages/message.service';
import { MessageCode } from '@/common/messages/message-codes';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';

// DTOs de Autenticación
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

// DTOs de Usuarios
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { FilterUsuarioDto } from '../dto/filter-usuario.dto';

// DTOs de Roles
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { FilterRoleDto } from '../dto/filter-role.dto';

// DTOs de Permisos
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { FilterPermissionDto } from '../dto/filter-permission.dto';

// DTOs de Paginación
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedUsuarioQueryDto } from '../dto/paginated-usuario-query.dto';
import { PaginatedRoleQueryDto } from '../dto/paginated-role-query.dto';
import { PaginatedPermissionQueryDto } from '../dto/paginated-permission-query.dto';

/**
 * Controller Principal del Dominio de Seguridades
 * 
 * Agrupa todas las funcionalidades del dominio de Seguridades:
 * - Autenticación (login, register, refresh-token)
 * - Gestión de usuarios (CRUD)
 * - Gestión de roles (CRUD)
 * - Gestión de permisos (CRUD)
 * - Menú dinámico
 * 
 * Sigue arquitectura DDD: funcionalidad agrupada por dominio, no por tablas.
 */
@ApiTags('Seguridades')
@Controller('seguridades')
export class SeguridadesController {
  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private menuService: MenuService,
    private responseHelper: ResponseHelper,
    private messageService: MessageService,
  ) {}

  // ============================================
  // SECCIÓN: AUTENTICACIÓN (Endpoints Públicos)
  // ============================================

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.login(loginDto, lang);
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Registro exitoso' })
  @ApiResponse({ status: 400, description: 'Error en los datos' })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.register(registerDto, lang);
  }

  @Post('auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.refreshToken(refreshTokenDto, lang);
  }

  // ============================================
  // SECCIÓN: PERFIL DEL USUARIO
  // ============================================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.getProfile(req.user.userId, lang);
  }

  // ============================================
  // SECCIÓN: GESTIÓN DE USUARIOS
  // ============================================

  @Get('usuarios')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuarios con paginación',
    description: 'Obtiene una lista paginada de usuarios. Puede incluir filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getUsuarios(@Query() queryDto: PaginatedUsuarioQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, ...filters } = queryDto;
    return this.usuarioService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getUsuario(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.findOne(id, lang);
  }

  @Post('usuarios')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async createUsuario(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.create(createUsuarioDto, lang);
  }

  @Put('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateUsuario(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.update(id, updateUsuarioDto, lang);
  }

  @Delete('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removeUsuario(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.remove(id, lang);
  }

  // ============================================
  // SECCIÓN: GESTIÓN DE ROLES
  // ============================================

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener roles con paginación',
    description: 'Obtiene una lista paginada de roles. Puede incluir filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getRoles(@Query() queryDto: PaginatedRoleQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, ...filters } = queryDto;
    return this.roleService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('roles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getRole(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.findOne(id, lang);
  }

  @Post('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async createRole(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.create(createRoleDto, lang);
  }

  @Put('roles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe o es un rol del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.update(id, updateRoleDto, lang);
  }

  @Delete('roles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un rol (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del rol (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar un rol del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removeRole(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.roleService.remove(id, lang);
  }

  // ============================================
  // SECCIÓN: GESTIÓN DE PERMISOS
  // ============================================

  @Get('permisos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener permisos con paginación',
    description: 'Obtiene una lista paginada de permisos. Puede incluir filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de permisos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getPermisos(@Query() queryDto: PaginatedPermissionQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, ...filters } = queryDto;
    return this.permissionService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('permisos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getPermiso(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.findOne(id, lang);
  }

  @Post('permisos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El código del permiso ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async createPermiso(@Body() createPermissionDto: CreatePermissionDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.create(createPermissionDto, lang);
  }

  @Put('permisos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede modificar un permiso del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updatePermiso(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.update(id, updatePermissionDto, lang);
  }

  @Delete('permisos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un permiso (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del permiso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Permiso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar un permiso del sistema' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removePermiso(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.permissionService.remove(id, lang);
  }

  // ============================================
  // SECCIÓN: MENÚ DINÁMICO
  // ============================================

  @Get('menu')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener menú privado según permisos del usuario',
    description: 'Requiere token JWT válido. Obtiene el roleId del token y devuelve solo items privados según permisos del usuario (combinando permisos de todos sus roles activos). Los items públicos son manejados por el frontend.',
  })
  @ApiResponse({ status: 200, description: 'Menú obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado (token inválido o ausente)' })
  async getMenu(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { message: 'Usuario no encontrado en el token' },
          401,
        ),
      );
    }

    const result = await this.menuService.getMenuByUser(userId, lang);

    // Si result tiene una propiedad 'alert', significa que el usuario no tiene permisos
    if (result && typeof result === 'object' && 'alert' in result) {
      const { menu: menuItems, alert } = result as any;

      // Crear respuesta con alerta en los detalles
      const alertMessage = await this.messageService.getMessage(MessageCode.ROLE_NO_PERMISSIONS, lang);
      return {
        data: menuItems || [],
        result: {
          statusCode: 200,
          description: alertMessage,
          details: {
            alert: true,
            userId: alert.userId,
            message: alert.message,
            permissionsCount: 0,
          },
        },
      };
    }

    return await this.responseHelper.successResponse(result, MessageCode.SUCCESS, lang);
  }
}
