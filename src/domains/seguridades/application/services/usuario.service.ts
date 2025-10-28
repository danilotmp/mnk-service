import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';

/**
 * Service de gestión de usuarios
 */
@Injectable()
export class UsuarioService {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(userId);
    if (!usuario) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.USER_NOT_FOUND,
        lang,
        null,
        404,
      );
      throw new Error('Usuario no encontrado');
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = usuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.SUCCESS,
      lang,
    );
  }
}

