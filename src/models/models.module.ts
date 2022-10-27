import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientAlertSettings } from './patient_alert_settings/entity/patient_alert_settings.entity';
import { ClinicianNote } from './clinician_note/entity/clinician_note.entity';
import { DoctorInfo } from './doctor_info/entity/doctor_info.entity';
import { Gateway } from './gateway/entity/gateway.entity';
import { MedicationPrescription } from './medication_prescription/entity/medication_prescription.entity';
import { PatientBreathingInput } from './patient_breathing_input/entity/patient_breathing_input.entity';
import { PatientHealthInputs } from './patient_health_inputs/entity/patient_health_inputs.entity';
import { PatientInfo } from './patient_info/entity/patient_info.entity';
import { PatientMedicationInput } from './patient_medication_input/entity/patient_medication_input.entity';
import { PatientNote } from './patient_note/entity/patient_note.entity';
import { PatientSymptomsInput } from './patient_symptoms_input/entity/patient_symptoms_input.entity';
import { Sensor } from './sensor/entity/sensor.entity';
import { CaretakerInfo } from './caretaker_info/entity/caretaker_info.entity';
import { User } from './user/entity/user.entity';
import { PatientSupervisionMapping } from './patient_supervision_mapping/entity/patient_supervision_mapping.entity';
import { File } from './file/entity/file.entity';
import { Appointment } from './appointment/entity/appointment.entity';
import { AppointmentUsers } from './appointment/entity/appointment_users.entity';
import { TrendsSettings } from './trends_settings/entity/trends_settings.entity';
import { Constants } from './constants/entity/constants.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PatientInfo,
      CaretakerInfo,
      DoctorInfo,
      PatientBreathingInput,
      PatientSymptomsInput,
      PatientHealthInputs,
      Gateway,
      Sensor,
      ClinicianNote,
      PatientNote,
      PatientAlertSettings,
      PatientSupervisionMapping,
      MedicationPrescription,
      PatientMedicationInput,
      Appointment,
      AppointmentUsers,
      File,
      TrendsSettings,
      Constants,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ModelsModule {}
