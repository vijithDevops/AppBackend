import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  // ManyToOne,
  // JoinColumn,
} from 'typeorm';
import { PatientHealthInputs } from '../../patient_health_inputs/entity/patient_health_inputs.entity';
import { PatientMedicationInput } from '../../patient_medication_input/entity/patient_medication_input.entity';
import { PatientSymptomsInput } from '../../patient_symptoms_input/entity/patient_symptoms_input.entity';
import { PatientBreathingInput } from '../../patient_breathing_input/entity/patient_breathing_input.entity';
import { PatientNote } from '../../patient_note/entity/patient_note.entity';
import { MedicationPrescription } from '../../medication_prescription/entity/medication_prescription.entity';
import { ClinicianNote } from '../../clinician_note/entity/clinician_note.entity';
import { Appointment } from '../../appointment/entity/appointment.entity';
import { UserAppointments } from '../../appointment/entity/user_appointment.view.entity';
import { BreatingExercisePrescription } from '../../breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';
import { PatientQuestionnaireInputMaster } from 'src/models/patient_questionnaire_input/entity/patient_questionnaire_input_master.entity';

// import { User } from '../user/user.entity';

@Entity()
@Index(['day', 'month', 'year'], {
  unique: true,
})
@Unique(['day', 'month', 'year'])
export class Calendar {
  @PrimaryGeneratedColumn('uuid')
  @Index('calendar_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'smallint' })
  day: number;

  @Column({ type: 'smallint' })
  month: number;

  @Column({ type: 'smallint' })
  year: number;

  @OneToMany(
    () => PatientHealthInputs,
    (PatientHealthInputs) => PatientHealthInputs.calendar,
  )
  patientHealthInputs: PatientHealthInputs[];

  @OneToMany(
    () => PatientMedicationInput,
    (patientMedicationInput) => patientMedicationInput.calendar,
  )
  patientMedicationInputs: PatientMedicationInput[];

  @OneToMany(
    () => PatientSymptomsInput,
    (patientSymptomsInput) => patientSymptomsInput.calendar,
  )
  patientSymptomsInputs: PatientSymptomsInput[];

  @OneToMany(
    () => PatientBreathingInput,
    (patientBreathingInput) => patientBreathingInput.calendar,
  )
  patientBreathingInputs: PatientBreathingInput[];

  @OneToMany(
    () => MedicationPrescription,
    (medicationPrescriptio) => medicationPrescriptio.calendar,
  )
  medicationPrescriptions: MedicationPrescription[];

  @OneToMany(
    () => BreatingExercisePrescription,
    (breathingPrescriptio) => breathingPrescriptio.calendar,
  )
  breathingExercisePrescriptions: BreatingExercisePrescription[];

  @OneToMany(() => ClinicianNote, (clinicianNote) => clinicianNote.calendar)
  clinicianNotes: ClinicianNote[];

  @OneToMany(() => Appointment, (appointment) => appointment.calendar)
  appointments: Appointment[];

  @OneToMany(() => PatientNote, (patientNote) => patientNote.calendar)
  patientNotes: PatientNote[];

  @OneToMany(
    () => UserAppointments,
    (userAppointments) => userAppointments.calendar,
  )
  userAppointments: UserAppointments[];

  @OneToMany(
    () => PatientQuestionnaireInputMaster,
    (patientSymptomsInputMaster) => patientSymptomsInputMaster.calendar,
  )
  patientQuestionnaireInput: PatientQuestionnaireInputMaster[];
}
