import { Controller, Get, Request, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { MenuService } from '../../application/services/menu.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageService } from '@/common/messages/message.service';
import { MessageCode } from '@/common/messages/message-codes';
import { MenuQueryDto } from '../dto/menu-query.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';

/**
 * Controller para el menú del sistema
 * 
 * Requiere:
 * - Token JWT válido (autenticación obligatoria)
 * - roleId como query parameter (obligatorio)
 * 
 * Devuelve solo items privados según permisos del rol.
 * Los items públicos son manejados por el frontend.
 */
@ApiTags('Menu')
@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(
    private menuService: MenuService,
    private responseHelper: ResponseHelper,
    private messageService: MessageService,
  ) {}

  /**
   * Obtener menú privado según permisos del rol
   * 
   * Comportamiento:
   * - Requiere token JWT válido (usuario autenticado)
   * - Requiere roleId como query parameter
   * - Devuelve solo items privados según permisos del rol
   * - No incluye items públicos (son manejados por el frontend)
   * - Si el rol no tiene permisos asignados, devuelve alerta
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener menú privado según permisos del rol',
    description: 'Requiere token JWT y roleId. Devuelve solo items privados según permisos del rol. Los items públicos son manejados por el frontend.'
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'roleId',
    required: true,
    type: String,
    description: 'ID del rol del usuario autenticado (UUID)',
    example: 'uuid-del-rol'
  })
  @ApiResponse({ status: 200, description: 'Menú obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'roleId es obligatorio' })
  @ApiResponse({ status: 401, description: 'No autenticado (token inválido o ausente)' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async getMenu(@Request() req, @Query() query: MenuQueryDto) {
    const lang = req.headers['accept-language'] || 'es';

    // Validar que roleId esté presente (ValidationPipe debería hacerlo automáticamente, pero por seguridad)
    if (!query.roleId) {
      throw new BadRequestException(
        await this.responseHelper.errorResponse(
          MessageCode.ROLE_ID_REQUIRED,
          lang,
          { field: 'roleId', message: 'El parámetro roleId es obligatorio' },
          400,
        ),
      );
    }

    const result = await this.menuService.getMenuByRole(query.roleId, lang);

    // Si result tiene una propiedad 'alert', significa que no hay permisos pero el rol existe
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
            roleId: query.roleId,
            roleName: alert.roleName,
            message: alert.message,
            permissionsCount: 0,
          },
        },
      };
    }

    return await this.responseHelper.successResponse(result, MessageCode.SUCCESS, lang);
  }
}

