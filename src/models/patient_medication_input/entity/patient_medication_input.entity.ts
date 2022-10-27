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
} from 'typeorm';

import { MedicationPrescription } from '../../medication_prescription/entity/medication_prescription.entity';
import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';

@Entity()
export class PatientMedicationInput {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_medication_input_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'int' })
  dosage: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @Column({
    name: 'deleted_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  deletedBy?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientMedicationInputs)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'medication_prescription_id' })
  medicationPrescriptionId: string;
  @ManyToOne(
    () => MedicationPrescription,
    (prescription) => prescription.patientMedicationInputs,
  )
  @JoinColumn({ name: 'medication_prescription_id' })
  medicationPrescription: MedicationPrescription;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientMedicationInputs)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
