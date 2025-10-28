import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { UsuarioService } from '../../application/services/usuario.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';

/**
 * Controller de autenticación
 * Maneja login, registro y renovación de tokens
 */
@ApiTags('Seguridades')
@Controller('seguridades')
export class SeguridadesController {
  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.login(loginDto, lang);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Registro exitoso' })
  @ApiResponse({ status: 400, description: 'Error en los datos' })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.register(registerDto, lang);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.authService.refreshToken(refreshTokenDto, lang);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@Request() req) {
    return this.usuarioService.getProfile(req.user.userId);
  }
}

