import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  AfterInsert,
  BeforeInsert,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';

@Entity()
export class PatientSymptomsInput {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_symptoms_input_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'integer' })
  coughingScore: number;

  @Column({ type: 'integer' })
  phlegmScore: number;

  @Column({ type: 'integer' })
  chestTightnessScore: number;

  @Column({ type: 'integer' })
  breathlessnessScore: number;

  @Column({ type: 'integer' })
  limitedActivityScore: number;

  @Column({ type: 'integer' })
  troubleSleepingScore: number;

  @Column({ type: 'integer' })
  energyScore: number;

  @Column({ type: 'integer', nullable: true })
  totalScore: number;

  @BeforeInsert()
  calcTotalScore() {
    this.totalScore =
      this.coughingScore +
      this.phlegmScore +
      this.chestTightnessScore +
      this.breathlessnessScore +
      this.limitedActivityScore +
      this.troubleSleepingScore +
      this.energyScore;
  }

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true, type: 'varchar', length: 254 })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar', length: 254 })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true, type: 'varchar', length: 254 })
  deletedBy?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientSymptomsInput)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientSymptomsInputs)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
