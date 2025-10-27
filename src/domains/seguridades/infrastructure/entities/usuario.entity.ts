import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';

/**
 * Entidad de Usuario
 * Representa un usuario del sistema multiempresa
 */
@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Campos para compatibilidad con multiempresa
  @Column({ nullable: true })
  currentBranchId: string;

  @Column({ type: 'simple-json', nullable: true })
  availableBranches: any[];

  @Column({ type: 'simple-json', nullable: true })
  roles: any[];

  @Column({ type: 'simple-json', nullable: true })
  permissions: any[];
}

