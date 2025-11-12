import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BranchEntity } from './branch.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Entidad de Company
 * Representa una empresa en el sistema multiempresa
 */
@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  email: string;

  @Column({ type: 'simple-json', nullable: true })
  address: any;

  @Column({ type: 'simple-json', nullable: true })
  settings: any;

  @Column({ type: 'simple-json', nullable: true })
  subscriptionPlan: any;

  @Column({ default: RecordStatus.ACTIVE })
  status: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => BranchEntity, (branch) => branch.company)
  branches: BranchEntity[];
}
