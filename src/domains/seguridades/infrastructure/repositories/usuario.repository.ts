import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../entities/usuario.entity';

/**
 * Repository de Usuario
 * Implementa el acceso a datos para usuarios
 */
@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repository: Repository<UsuarioEntity>,
  ) {}

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<UsuarioEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    return this.repository.save(usuario);
  }

  create(usuarioData: Partial<UsuarioEntity>): UsuarioEntity {
    return this.repository.create(usuarioData);
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return this.repository.find();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

