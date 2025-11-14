import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyEntity } from './company.entity';
import { UserRoleEntity } from './user-role.entity';
import { RolePermissionEntity } from './role-permission.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Entidad de Rol
 * Representa un rol en el sistema (ej: Admin, Usuario, Editor)
 */
@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ unique: true })
  code: string; // 'ADMIN', 'USUARIO', 'EDITOR' - Código único en mayúsculas

  @Column({ unique: true })
  name: string; // 'Administrador', 'Usuario', 'Editor' - Nombre único para mostrar

  @Column({ nullable: true })
  description: string;

  @Column({ default: RecordStatus.ACTIVE })
  status: number;

  @Column({ default: false })
  isSystem: boolean; // Si es un rol del sistema (no se puede eliminar)

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermissionEntity[];
}
