import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Tipo de permiso
 * - PAGE: Acceso a una página/ruta
 * - ACTION: Acción dentro de una página (crear, editar, eliminar, etc.)
 */
export enum PermissionType {
  PAGE = 'PAGE',
  ACTION = 'ACTION',
}

/**
 * Entidad de Permiso
 * Representa un permiso en el sistema (página o acción)
 */
@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // 'home', 'products', 'users.create', 'users.edit', etc.

  @Column()
  name: string; // Nombre descriptivo

  @Column({
    type: 'simple-enum',
    enum: PermissionType,
    default: PermissionType.PAGE,
  })
  type: PermissionType; // PAGE o ACTION

  @Column({ nullable: true })
  resource: string; // 'home', 'products', 'users', etc.

  @Column({ nullable: true })
  action: string; // 'view', 'create', 'edit', 'delete', etc. (solo para ACTION)

  @Column({ nullable: true })
  route: string; // Ruta del frontend (solo para PAGE)

  @Column({ nullable: true })
  menuId: string; // ID del item del menú (solo para PAGE)

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isPublic: boolean; // Si es público (no requiere autenticación)

  @Column({ default: RecordStatus.ACTIVE })
  status: number;

  @Column({ default: false })
  isSystem: boolean; // Si es un permiso del sistema (no se puede eliminar)

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermissionEntity[];
}
