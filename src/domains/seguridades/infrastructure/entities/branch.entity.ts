import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';

/**
 * Entidad de Branch (Sucursal)
 * Representa una sucursal de una empresa
 */
@Entity('branches')
export class BranchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string; // 'headquarters' | 'branch' | 'warehouse' | 'store'

  @Column({ type: 'simple-json', nullable: true })
  address: any;

  @Column({ type: 'simple-json', nullable: true })
  contactInfo: any;

  @Column({ type: 'simple-json', nullable: true })
  settings: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

