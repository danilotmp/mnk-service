import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import { CreateUsuarioDto } from '../../presentation/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../../presentation/dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

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
        {
          error: 'USER_NOT_FOUND',
          userId,
          message: 'User not found in database',
        },
        404,
      );
      throw new NotFoundException(errorResponse);
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = usuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(lang: string = 'es') {
    const usuarios = await this.usuarioRepository.findAll();
    
    // Retornar sin contraseñas
    const usuariosSinPassword = usuarios.map((usuario) => {
      const { password, ...userWithoutPassword } = usuario;
      return userWithoutPassword;
    });

    return await this.responseHelper.successResponse(usuariosSinPassword, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = usuario;

    return await this.responseHelper.successResponse(userWithoutPassword, MessageCode.SUCCESS, lang);
  }

  /**
   * Crear un nuevo usuario
   */
  async create(createUsuarioDto: CreateUsuarioDto, lang: string = 'es') {
    // Verificar que el email no exista
    const existingUser = await this.usuarioRepository.findByEmail(createUsuarioDto.email);
    if (existingUser) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.EMAIL_EXISTS,
          lang,
          { error: 'EMAIL_EXISTS', email: createUsuarioDto.email, message: 'Email already exists' },
          409,
        ),
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Crear el usuario
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      isActive: createUsuarioDto.isActive !== undefined ? createUsuarioDto.isActive : true,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = savedUsuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.USER_CREATED,
      lang,
      201,
    );
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Si se actualiza el email, verificar que no exista
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findByEmail(updateUsuarioDto.email);
      if (existingUser) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.EMAIL_EXISTS,
            lang,
            { error: 'EMAIL_EXISTS', email: updateUsuarioDto.email, message: 'Email already exists' },
            409,
          ),
        );
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    // Actualizar el usuario
    Object.assign(usuario, updateUsuarioDto);
    const updatedUsuario = await this.usuarioRepository.save(usuario);

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = updatedUsuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.PROFILE_UPDATED,
      lang,
    );
  }

  /**
   * Eliminar (soft delete) un usuario
   */
  async remove(id: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Soft delete: marcar como inactivo
    usuario.isActive = false;
    await this.usuarioRepository.save(usuario);

    return await this.responseHelper.successResponse(
      { id, message: 'Usuario eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}

