import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { createSuccessResponse } from '@/common/dto/response.dto';

/**
 * Service de gestión de usuarios
 */
@Injectable()
export class UsuarioService {
  constructor(private usuarioRepository: UsuarioRepository) {}

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string) {
    const usuario = await this.usuarioRepository.findOne(userId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = usuario;

    return createSuccessResponse(
      userWithoutPassword,
      'Perfil obtenido exitosamente',
    );
  }
}

