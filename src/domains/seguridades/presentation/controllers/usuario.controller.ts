import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { UsuarioService } from '../../application/services/usuario.service';

/**
 * Controller de gestión de usuarios
 */
@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getCurrentUser(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.usuarioService.getProfile(req.user.userId, lang);
  }
}

