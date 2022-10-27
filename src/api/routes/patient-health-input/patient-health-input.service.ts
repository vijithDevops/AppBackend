import { PatientHealthInputs } from './../../../models/patient_health_inputs/entity/patient_health_inputs.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PatientHealthInputModelService } from 'src/models/patient_health_inputs/patient_health_inputs.model.service';
import { LogService } from '../../../services/logger/logger.service';

@Injectable()
export class PatientHealthInputService {
  constructor(
    private logService: LogService,
    private readonly patientHealthInputModelService: PatientHealthInputModelService,
  ) {}

  async validateCreateHealthInput(
    patientId: string,
    calendarId: string,
  ): Promise<void> {
    const input = await this.patientHealthInputModelService.findByPatientId(
      patientId,
      { calendarId },
    );
    if (input && input.length > 0) {
      throw new HttpException(
        `Health input already added for today's date`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateAndGetPatientHealthInput(
    id: string,
  ): Promise<PatientHealthInputs> {
    const input = await this.patientHealthInputModelService.findOneById(id);
    if (!input) {
      throw new BadRequestException('Invalid patient health input');
    }
    return input;
  }
}
