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
import { PermissionEntity } from './permission.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Entidad de MenuItem
 * Representa un item del menú del sistema
 */
@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  menuId: string; // 'home', 'explore', 'products', etc.

  @Column()
  label: string; // Label para mostrar en el menú

  @Column({ nullable: true })
  route: string; // Ruta del frontend (ej: '/', '/main/explore')

  @Column({ nullable: true, name: 'parent_id' })
  parentId: string; // ID del menú padre (para submenús)

  @ManyToOne(() => MenuItemEntity, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuItemEntity;

  @OneToMany(() => MenuItemEntity, (menu) => menu.parent)
  children: MenuItemEntity[];

  @Column({ type: 'simple-json', nullable: true })
  columns: any[]; // Columnas para menús multi-columna (ej: productos)

  @Column({ type: 'simple-json', nullable: true })
  submenu: any[]; // Submenús simples

  @Column({ nullable: true })
  icon: string; // Icono del menú

  @Column({ nullable: true })
  description: string; // Descripción del menú

  @Column({ default: true })
  isPublic: boolean; // Si es público (no requiere autenticación)

  @Column({ default: RecordStatus.ACTIVE })
  status: number;

  @Column({ default: 0 })
  order: number; // Orden de aparición en el menú

  @Column({ nullable: true, name: 'permission_id' })
  permissionId: string; // Permiso requerido para ver este item

  @ManyToOne(() => PermissionEntity, { nullable: true })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
