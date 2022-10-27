import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../models/user/entity/user.enum';
import { RolesGuard } from '../../../common/guards/role.guard';
import { PatientMedicationInputService } from './patient-medication-input.service';
import {
  CreatePatientMedicationInputsDto,
  PatientMedicationInputListPaginated,
} from './dto/';
import { getPagination } from '../../../common/utils/entity_metadata';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { PatientMedicationInputModelService } from '../../../models/patient_medication_input/patient_medication_input.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('patient-medication-input')
@ApiTags('Patient-Medication-Input')
@ApiBearerAuth()
export class PatientMedicationInputController {
  constructor(
    private readonly patientMedicationInputService: PatientMedicationInputService,
    private readonly patientMedicationInputModelService: PatientMedicationInputModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async create(
    @Request() req,
    @Body() createPatientMedicationInputsDto: CreatePatientMedicationInputsDto,
  ) {
    const calendar = await this.calendarModelService.getCalendarDate(
      new Date(),
    );
    const patientId =
      req.user.role === Role.CARETAKER
        ? req.user.caretakersPatient.patientId
        : req.user.id;
    if (!patientId) {
      throw new ForbiddenException();
    }
    const medicationInputs = await this.patientMedicationInputService.validateAndGetCreateMedicationPrescriptionInputs(
      createPatientMedicationInputsDto.medications,
      patientId,
      calendar,
    );
    return await this.patientMedicationInputModelService
      .createMany(medicationInputs)
      .catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/')
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async getAllPatientMedicationInputsPaginated(
    @Query() queryParams: PatientMedicationInputListPaginated,
  ) {
    const { page, perPage, ...filterOptions } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    if (filterOptions.date) {
      filterOptions['calendarId'] = (
        await this.calendarModelService.getCalendarDate(
          new Date(filterOptions.date),
        )
      ).id;
    }
    return await this.patientMedicationInputModelService.findAllPaginatedAndFilter(
      {
        skip,
        limit,
        ...filterOptions,
      },
    );
  }
}
