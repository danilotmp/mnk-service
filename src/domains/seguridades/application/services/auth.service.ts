import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { createSuccessResponse, createErrorResponse } from '@/common/dto/response.dto';
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
  ) {}

  /**
   * Iniciar sesión y generar tokens JWT
   */
  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
    if (!usuario) {
      throw new UnauthorizedException(
        createErrorResponse('Credenciales inválidas', 'El email o contraseña son incorrectos', 401),
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        createErrorResponse('Credenciales inválidas', 'El email o contraseña son incorrectos', 401),
      );
    }

    // Validar que el usuario esté activo
    if (!usuario.isActive) {
      throw new UnauthorizedException(
        createErrorResponse('Usuario inactivo', 'Su cuenta ha sido desactivada', 403),
      );
    }

    // Generar tokens
    const tokens = await this.generateTokens(usuario);

    // Actualizar último acceso
    usuario.lastLogin = new Date();
    await this.usuarioRepository.save(usuario);

    return createSuccessResponse(
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
      'Inicio de sesión exitoso',
    );
  }

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException(
        createErrorResponse('Email ya registrado', 'Este email ya está en uso', 400),
      );
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

    return createSuccessResponse(
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
      'Registro exitoso',
    );
  }

  /**
   * Refrescar token de acceso usando refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verificar el refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      // Buscar usuario
      const usuario = await this.usuarioRepository.findOne(payload.sub);
      if (!usuario || !usuario.isActive) {
        throw new UnauthorizedException(
          createErrorResponse('Token inválido', 'El refresh token no es válido', 401),
        );
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(usuario);

      return createSuccessResponse(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        'Token refrescado exitosamente',
      );
    } catch (error) {
      throw new UnauthorizedException(
        createErrorResponse('Token inválido o expirado', error.message, 401),
      );
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

