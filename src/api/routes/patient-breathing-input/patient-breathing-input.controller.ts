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
import { PatientBreathingInputService } from './patient-breathing-input.service';
import {
  CreatePatientBreathingInputsDto,
  PatientBreathingInputListPaginated,
} from './dto/';
import { getPagination } from '../../../common/utils/entity_metadata';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { PatientBreathingInputModelService } from '../../../models/patient_breathing_input/patient_breathing_input.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('patient-breathing-input')
@ApiTags('Patient-Breathing-Input')
@ApiBearerAuth()
export class PatientBreathingInputController {
  constructor(
    private readonly patientBreathingInputService: PatientBreathingInputService,
    private readonly patientBreathingInputModelService: PatientBreathingInputModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async create(
    @Request() req,
    @Body() createPatientBreathingInputDto: CreatePatientBreathingInputsDto,
  ) {
    try {
      const calendar = await this.calendarModelService.getCalendarDate(
        new Date(),
      );
      const patientId =
        req.user.role === Role.PATIENT
          ? req.user.id
          : req.user.caretakersPatient.patientId;
      if (!patientId) {
        throw new ForbiddenException();
      }
      const createBreathingInputs = await this.patientBreathingInputService.validateAndGetCreateBreathingPrescriptionInputs(
        createPatientBreathingInputDto.breathingInputs,
        patientId,
        calendar,
      );
      return await this.patientBreathingInputModelService
        .createMany(createBreathingInputs)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
    } catch (error) {
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
  async getAllPatientBreathingInputsPaginated(
    @Query() queryParams: PatientBreathingInputListPaginated,
  ) {
    const {
      patientId,
      breathingPrescriptionId,
      sort,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.patientBreathingInputModelService.findAllPaginatedAndFilter(
      {
        skip,
        limit,
        patientId,
        breathingPrescriptionId,
        sort,
      },
    );
  }
}
