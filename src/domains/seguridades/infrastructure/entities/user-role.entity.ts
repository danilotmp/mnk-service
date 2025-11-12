import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';
import { RoleEntity } from './role.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Entidad de Relación Usuario-Rol
 * Representa la relación muchos a muchos entre usuarios y roles
 */
@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'branch_id', nullable: true })
  branchId: string; // Rol específico para una sucursal (opcional)

  @Column({ default: RecordStatus.ACTIVE })
  status: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => UsuarioEntity, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsuarioEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
