import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import * as bcrypt from 'bcrypt';

/**
 * Service de autenticación
 * Implementa la lógica de negocio para login, registro y gestión de tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Iniciar sesión y generar tokens JWT
   */
  async login(loginDto: LoginDto, lang: string = 'es') {
    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
    if (!usuario) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INVALID_CREDENTIALS,
        lang,
        {
          error: 'USER_NOT_FOUND',
          email: loginDto.email,
          message: 'User not found in database',
        },
        401,
      );
      throw new UnauthorizedException(errorResponse);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!isPasswordValid) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INVALID_CREDENTIALS,
        lang,
        {
          error: 'INVALID_PASSWORD',
          userId: usuario.id,
          message: 'Password hash comparison failed',
        },
        401,
      );
      throw new UnauthorizedException(errorResponse);
    }

    // Validar que el usuario esté activo
    if (!usuario.isActive) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.USER_INACTIVE,
        lang,
        null,
        403,
      );
      throw new UnauthorizedException(errorResponse);
    }

    // Generar tokens
    const tokens = await this.generateTokens(usuario);

    // Actualizar último acceso
    usuario.lastLogin = new Date();
    await this.usuarioRepository.save(usuario);

    return await this.responseHelper.successResponse(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: usuario.id,
          email: usuario.email,
          firstName: usuario.firstName,
          lastName: usuario.lastName,
          companyId: usuario.companyId,
        },
      },
      MessageCode.LOGIN_SUCCESS,
      lang,
    );
  }

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto, lang: string = 'es') {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioRepository.findByEmail(registerDto.email);
    if (existingUser) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.EMAIL_EXISTS,
        lang,
        null,
        400,
      );
      throw new BadRequestException(errorResponse);
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear nuevo usuario
    const newUsuario = this.usuarioRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      companyId: registerDto.companyId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUsuario = await this.usuarioRepository.save(newUsuario);

    // Generar tokens
    const tokens = await this.generateTokens(savedUsuario);

    return await this.responseHelper.successResponse(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: savedUsuario.id,
          email: savedUsuario.email,
          firstName: savedUsuario.firstName,
          lastName: savedUsuario.lastName,
          companyId: savedUsuario.companyId,
        },
      },
      MessageCode.REGISTER_SUCCESS,
      lang,
    );
  }

  /**
   * Refrescar token de acceso usando refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto, lang: string = 'es') {
    try {
      // Verificar el refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      // Buscar usuario
      const usuario = await this.usuarioRepository.findOne(payload.sub);
      if (!usuario || !usuario.isActive) {
        const errorResponse = await this.responseHelper.errorResponse(
          MessageCode.TOKEN_INVALID,
          lang,
          {
            error: 'INVALID_REFRESH_TOKEN',
            userId: payload.sub,
            isActive: usuario?.isActive || false,
            message: 'Refresh token validation failed or user inactive',
          },
          401,
        );
        throw new UnauthorizedException(errorResponse);
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(usuario);

      return await this.responseHelper.successResponse(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        MessageCode.TOKEN_REFRESHED,
        lang,
      );
    } catch (error) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.TOKEN_EXPIRED,
        lang,
        {
          error: error.name || 'TOKEN_EXPIRED',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        401,
      );
      throw new UnauthorizedException(errorResponse);
    }
  }

  /**
   * Validar token JWT
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.usuarioRepository.findOne(payload.sub);
      
      if (!usuario || !usuario.isActive) {
        return null;
      }

      return usuario;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generar tokens JWT (access y refresh)
   */
  private async generateTokens(usuario: any) {
    const payload = { email: usuario.email, sub: usuario.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }
}

