import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserAppointmentResponseDto } from 'src/api/routes/appointment/dto/responses/user_appointment.response.dto';
import { ClinicianNoteResponseDto } from 'src/api/routes/clinician-note/dto/responses/clinician_note.response.dto';
import { PatientBreathingInputResponseDto } from 'src/api/routes/patient-breathing-input/dto/responses/patient_breathing_input.response.dto';
import { PatientHealthInputResponseDto } from 'src/api/routes/patient-health-input/dto/responses/patient_health_input.response.dto';
import { PatientMedicationInputResponseDto } from 'src/api/routes/patient-medication-input/dto/responses/patient_medication_input.response.dto';
import { PatientNoteResponseDto } from 'src/api/routes/patient-note/dto/responses/patient_note.response.dto';
import { PatientSymptomsInputResponseDto } from 'src/api/routes/patient-symptoms-input/dto/responses/patient_symptoms_input.response.dto';

export class GetCalendarResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  day: number;

  @ApiProperty()
  @IsNotEmpty()
  month: number;

  @ApiProperty()
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    isArray: true,
    type: PatientHealthInputResponseDto,
  })
  patientHealthInputs: PatientHealthInputResponseDto[];

  @ApiProperty({
    isArray: true,
    type: PatientMedicationInputResponseDto,
  })
  patientMedicationInputs: PatientMedicationInputResponseDto[];

  @ApiProperty({
    isArray: true,
    type: ClinicianNoteResponseDto,
  })
  clinicianNotes: ClinicianNoteResponseDto[];

  @ApiProperty({
    isArray: true,
    type: PatientNoteResponseDto,
  })
  patientNotes: PatientNoteResponseDto[];

  @ApiProperty({
    isArray: true,
    type: PatientSymptomsInputResponseDto,
  })
  patientSymptomsInputs: PatientSymptomsInputResponseDto[];

  @ApiProperty({
    isArray: true,
    type: PatientBreathingInputResponseDto,
  })
  patientBreathingInputs: PatientBreathingInputResponseDto[];

  @ApiProperty({
    isArray: true,
    type: UserAppointmentResponseDto,
  })
  userAppointments: UserAppointmentResponseDto[];
}
