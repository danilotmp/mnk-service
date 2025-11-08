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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { UsuarioService } from '../../application/services/usuario.service';
import { RoleService } from '../../application/services/role.service';
import { PermissionService } from '../../application/services/permission.service';
import { AccessService } from '../../application/services/access.service';
import { MenuService } from '../../application/services/menu.service';
import { AuthorizationService } from '../../application/services/authorization.service';
import { CompanyService } from '../../application/services/company.service';
import { BranchService } from '../../application/services/branch.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageService } from '@/common/messages/message.service';
import { MessageCode } from '@/common/messages/message-codes';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../infrastructure/guards/permissions.guard';
import { Permissions } from '../../infrastructure/decorators/permissions.decorator';

// DTOs de Autenticación
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

// DTOs de Usuarios
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UpdateUsuarioCompletoDto } from '../dto/update-usuario-completo.dto';

// DTOs de Roles
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

// DTOs de Permisos
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

// DTOs de Empresas
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { PaginatedCompanyQueryDto } from '../dto/paginated-company-query.dto';

// DTOs de Sucursales
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { PaginatedBranchQueryDto } from '../dto/paginated-branch-query.dto';

// DTOs de Paginación
import { PaginatedUsuarioQueryDto } from '../dto/paginated-usuario-query.dto';
import { PaginatedRoleQueryDto } from '../dto/paginated-role-query.dto';
import { PaginatedPermissionQueryDto } from '../dto/paginated-permission-query.dto';
import { PaginatedAccessQueryDto } from '../dto/paginated-access-query.dto';
import { CheckAccessQueryDto } from '../dto/check-access-query.dto';

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
    private accessService: AccessService,
    private menuService: MenuService,
    private authorizationService: AuthorizationService,
    private companyService: CompanyService,
    private branchService: BranchService,
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.view'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuarios con paginación',
    description: 'Obtiene una lista paginada de usuarios. Puede incluir filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getUsuarios(@Query() queryDto: PaginatedUsuarioQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, search, searchTerm, ...otherFilters } = queryDto;
    
    // Normalizar el término de búsqueda: priorizar 'search' sobre 'searchTerm'
    const normalizedSearchTerm = search || searchTerm;
    
    const filters = {
      ...otherFilters,
      ...(normalizedSearchTerm && { searchTerm: normalizedSearchTerm }),
    };
    
    return this.usuarioService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('usuarios/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.view'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.create'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.edit'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.delete'])
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
  // ACTUALIZACIÓN COMPLETA (Datos + Roles + Sucursales)
  // ============================================

  @Put('usuarios/:id/completo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.edit'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar usuario completo (datos básicos + rol + sucursales)',
    description: `
    Endpoint TODO-EN-UNO para formularios de edición de usuarios.
    
    ✅ Actualiza datos básicos del usuario
    ✅ Asigna rol principal (opcional)
    ✅ Asigna sucursales disponibles (opcional)
    
    **Uso típico**: Formulario de edición que maneja todo en una sola petición.
    
    **Ventaja**: El frontend solo hace UNA llamada para actualizar todo.
    `,
  })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado completamente',
    schema: {
      example: {
        data: {
          id: 'uuid-usuario',
          email: 'usuario@empresa.com',
          firstName: 'Juan',
          lastName: 'Pérez',
          companyId: 'uuid-empresa',
          isActive: true,
          availableBranches: [
            { id: 'uuid-1', code: 'SUC001', name: 'Sucursal Centro' },
            { id: 'uuid-2', code: 'SUC002', name: 'Sucursal Norte' },
          ],
          currentBranchId: 'uuid-1',
        },
        result: {
          statusCode: 200,
          description: 'Recurso actualizado exitosamente',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario, rol o sucursal no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o sucursal no pertenece a la empresa' })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateUsuarioCompleto(
    @Param('id') id: string,
    @Body() updateDto: UpdateUsuarioCompletoDto,
    @Request() req,
  ) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.updateCompleto(id, updateDto, lang);
  }

  // ============================================
  // CONSULTAR ROLES Y SUCURSALES DE USUARIO
  // ============================================

  @Get('usuarios/:id/roles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.view'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener roles asignados a un usuario',
    description: 'Retorna la lista de roles que tiene asignados el usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles del usuario',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-rol',
            name: 'admin',
            displayName: 'Administrador',
            description: 'Rol con todos los permisos',
            isActive: true,
            assignedAt: '2024-01-01T10:00:00.000Z',
          },
        ],
        result: {
          statusCode: 200,
          description: 'Operación exitosa',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getUserRoles(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.getUserRoles(id, lang);
  }

  @Get('usuarios/:id/sucursales')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['users.view'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener sucursales asignadas a un usuario',
    description: 'Retorna la lista de sucursales disponibles para el usuario y su sucursal actual.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Sucursales del usuario',
    schema: {
      example: {
        data: {
          currentBranchId: 'uuid-sucursal-1',
          availableBranches: [
            { id: 'uuid-1', code: 'SUC001', name: 'Sucursal Centro' },
            { id: 'uuid-2', code: 'SUC002', name: 'Sucursal Norte' },
          ],
        },
        result: {
          statusCode: 200,
          description: 'Operación exitosa',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getUserBranches(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.getUserBranches(id, lang);
  }

  // ============================================
  // SECCIÓN: GESTIÓN DE ROLES
  // ============================================

  @Get('roles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['roles.view'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['roles.view'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['roles.create'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['roles.edit'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['roles.delete'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['permissions.view'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['permissions.view'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['permissions.manage'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['permissions.manage'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['permissions.manage'])
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
  // SECCIÓN: GESTIÓN DE ACCESOS (Usuario-Rol)
  // ============================================

  @Get('accesos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['security.accesses.view'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener accesos (usuario-rol) con paginación' })
  async getAccesses(@Query() queryDto: PaginatedAccessQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, userId, roleId, branchId, isActive } = queryDto;
    return this.accessService.findPaginated(
      { page, limit },
      { userId, roleId, branchId, isActive },
      lang,
    );
  }

  @Get('accesos/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['security.accesses.view'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un acceso específico (usuario-rol)' })
  @ApiParam({ name: 'id', description: 'ID del acceso (UUID)', type: String })
  async getAccess(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.accessService.findOne(id, lang);
  }

  // ============================================
  // SECCIÓN: VALIDACIÓN DE ACCESO PUNTUAL
  // ============================================

  @Get('access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validar acceso del usuario autenticado a una ruta específica',
    description:
      'Permite al frontend validar si el usuario autenticado puede acceder a una ruta determinada. Devuelve 200 si tiene acceso y 403 en caso contrario.',
  })
  @ApiQuery({
    name: 'route',
    required: true,
    type: String,
    description: 'Ruta del frontend que se desea validar (ej: /security/users)',
    example: '/security/users',
  })
  @ApiResponse({ status: 200, description: 'El usuario tiene acceso a la ruta solicitada' })
  @ApiResponse({ status: 403, description: 'El usuario no tiene permisos para acceder a la ruta' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async checkAccess(@Query() queryDto: CheckAccessQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const userId = req.user?.userId || null;
    const { route } = queryDto;
    const normalizedRoute = this.normalizeRoute(route);

    const canAccess = await this.authorizationService.canAccessRoute(userId, normalizedRoute);

    if (!canAccess) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        { route: normalizedRoute },
        HttpStatus.FORBIDDEN,
      );
      throw new ForbiddenException(errorResponse);
    }

    return this.responseHelper.successResponse(
      { route: normalizedRoute, access: true },
      MessageCode.SUCCESS,
      lang,
    );
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

  // ============================================
  // SECCIÓN: GESTIÓN DE EMPRESAS (ADMINISTRATIVO)
  // ============================================

  @Get('admin/empresas')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['companies.view'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener empresas con paginación',
    description: 'Obtiene una lista paginada de empresas. Puede incluir filtros opcionales.',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getCompanies(@Query() queryDto: PaginatedCompanyQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, search, ...otherFilters } = queryDto;
    
    const filters = {
      ...otherFilters,
      ...(search && { search }),
    };
    
    return this.companyService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('admin/empresas/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['companies.view'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una empresa por ID (Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la empresa (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Empresa obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getCompany(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.companyService.findOne(id, lang);
  }

  @Post('admin/empresas')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['companies.create'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.companyService.create(createCompanyDto, lang);
  }

  @Put('admin/empresas/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['companies.edit'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una empresa (Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la empresa (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.companyService.update(id, updateCompanyDto, lang);
  }

  @Delete('admin/empresas/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['companies.delete'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una empresa (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la empresa (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removeCompany(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.companyService.remove(id, lang);
  }

  // ============================================
  // SECCIÓN: GESTIÓN DE SUCURSALES (ADMINISTRATIVO)
  // ============================================

  @Get('admin/sucursales')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.view'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener sucursales con paginación',
    description: 'Obtiene una lista paginada de sucursales. Puede incluir filtros opcionales como companyId.',
  })
  @ApiResponse({ status: 200, description: 'Lista de sucursales obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getBranches(@Query() queryDto: PaginatedBranchQueryDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const { page, limit, search, ...otherFilters } = queryDto;
    
    const filters = {
      ...otherFilters,
      ...(search && { search }),
    };
    
    return this.branchService.findPaginated(
      { page, limit },
      filters,
      lang,
    );
  }

  @Get('admin/sucursales/empresa/:companyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.view'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las sucursales de una empresa (Admin)' })
  @ApiParam({ name: 'companyId', description: 'ID de la empresa (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Lista de sucursales obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getBranchesByCompany(@Param('companyId') companyId: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.branchService.findByCompany(companyId, lang);
  }

  @Get('admin/sucursales/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.view'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una sucursal por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sucursal (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Sucursal obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getBranch(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.branchService.findOne(id, lang);
  }

  @Post('admin/sucursales')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.create'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva sucursal (Admin)' })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async createBranch(@Body() createBranchDto: CreateBranchDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.branchService.create(createBranchDto, lang);
  }

  @Put('admin/sucursales/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.edit'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una sucursal' })
  @ApiParam({ name: 'id', description: 'ID de la sucursal (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Sucursal actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateBranch(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.branchService.update(id, updateBranchDto, lang);
  }

  @Delete('admin/sucursales/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['branches.delete'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una sucursal (soft delete - Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la sucursal (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Sucursal eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removeBranch(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.branchService.remove(id, lang);
  }

  private normalizeRoute(route: string): string {
    if (!route) {
      return '';
    }

    let cleanedRoute = route.trim();

    try {
      cleanedRoute = decodeURIComponent(cleanedRoute);
    } catch (error) {
      // Ignorar errores de decodificación y usar la ruta original
    }

    if (cleanedRoute.startsWith('http://') || cleanedRoute.startsWith('https://')) {
      try {
        const url = new URL(cleanedRoute);
        cleanedRoute = url.pathname;
      } catch (error) {
        // Mantener la ruta original si no es una URL válida
      }
    }

    cleanedRoute = cleanedRoute.split('?')[0].split('#')[0];

    if (!cleanedRoute.startsWith('/')) {
      cleanedRoute = `/${cleanedRoute}`;
    }

    return cleanedRoute || '/';
  }
}
