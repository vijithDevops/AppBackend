import { Calendar } from 'src/models/calendar/entity/calendar.entity';
import { User } from 'src/models/user/entity/user.entity';
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
  OneToMany,
} from 'typeorm';
import { PatientQuestionnaireInputs } from './patient_questionnaire_inputs.entity';

@Entity('patient_questionnaire_input_master')
export class PatientQuestionnaireInputMaster {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_questionnaire_input_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientQuestionnaireInput)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientQuestionnaireInput)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;

  @Column({ name: 'total_score', type: 'integer' })
  totalScore: number;

  @OneToMany(
    () => PatientQuestionnaireInputs,
    (patientQuestionnaireInputs) =>
      patientQuestionnaireInputs.patientQuestionnaireInputMaster,
  )
  patientInputs: PatientQuestionnaireInputs[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;
}
