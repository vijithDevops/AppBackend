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

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../models/user/entity/user.enum';
import { RolesGuard } from '../../../common/guards/role.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientSymptomsInputService } from './patient-symptoms-input.service';
import {
  CreatePatientSymptomsInputDto,
  PatientSymptomsInputListPaginated,
} from './dto/';
import { getPagination } from '../../../common/utils/entity_metadata';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { PatientSymptomsInputModelService } from '../../../models/patient_symptoms_input/patient_symptoms_input.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { LogService } from '../../../services/logger/logger.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('patient-symptoms-input')
@ApiTags('Patient-Symptoms-Input')
@ApiBearerAuth()
export class PatientSymptomsInputController {
  constructor(
    private logService: LogService,
    private readonly patientSymptomsInputService: PatientSymptomsInputService,
    private readonly patientSymptomsInputModelService: PatientSymptomsInputModelService,
    private readonly calendarModelService: CalendarModelService,
    private readonly userModelService: UserModelService,
  ) {}

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async create(
    @Request() req,
    @Body() createPatientSymptomsInputDto: CreatePatientSymptomsInputDto,
  ) {
    try {
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
      const patient =
        req.user.role === Role.PATIENT
          ? req.user
          : await this.userModelService.findOneById(patientId, Role.PATIENT);
      await this.patientSymptomsInputService.validateCreateSymptomsInput(
        patient.id,
        calendar.id,
      );
      const symptomsInput = await this.patientSymptomsInputModelService
        .create({
          ...createPatientSymptomsInputDto,
          totalScore: Object.values(createPatientSymptomsInputDto).reduce(
            (accum, cur) => accum + cur,
          ),
          patientId: patient.id,
          calendarId: (
            await this.calendarModelService.getCalendarDate(new Date())
          ).id,
        })
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      this.patientSymptomsInputService.SendPatientAlertForSymptomsScore(
        symptomsInput.totalScore,
        patient,
      );
      return symptomsInput;
    } catch (error) {
      this.logService.logError('Failed to create symptoms input', error);
      throw error;
    }
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/')
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async getAllPatientSymptomsInputsPaginated(
    @Query() queryParams: PatientSymptomsInputListPaginated,
  ) {
    const { patientId, sort, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.patientSymptomsInputModelService.findAllPaginatedAndFilter(
      {
        skip,
        limit,
        patientId,
        sort,
      },
    );
  }
}
