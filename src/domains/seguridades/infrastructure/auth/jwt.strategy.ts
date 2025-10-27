import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioRepository } from '../repositories/usuario.repository';

/**
 * Estrategia JWT para Passport
 * Valida tokens JWT en requests autenticados
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuarioRepository: UsuarioRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioRepository.findOne(payload.sub);
    
    if (!usuario || !usuario.isActive) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    return { userId: usuario.id, email: usuario.email, companyId: usuario.companyId };
  }
}

