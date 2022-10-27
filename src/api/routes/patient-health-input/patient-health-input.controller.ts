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
  Patch,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PatientHealthInputService } from './patient-health-input.service';
import { CreatePatientHealthInputDto } from './dto/create-patient-health-input.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../models/user/entity/user.enum';
import { RolesGuard } from '../../../common/guards/role.guard';
import { PatientHealthInputListPaginated } from './dto/patient-health-input-list.dto';
import { getPagination } from '../../../common/utils/entity_metadata';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { PatientHealthInputModelService } from '../../../models/patient_health_inputs/patient_health_inputs.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { UpdatePatientHealthInputDto } from './dto';
import { PatientHealthInputs } from 'src/models/patient_health_inputs/entity/patient_health_inputs.entity';

@Controller('patient-health-input')
@ApiTags('Patient-Health-Input')
@ApiBearerAuth()
export class PatientHealthInputController {
  constructor(
    private logService: LogService,
    private readonly patientHealthInputService: PatientHealthInputService,
    private readonly patientHealthInputModelService: PatientHealthInputModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async create(
    @Request() req,
    @Body() createPatientHealthInputDto: CreatePatientHealthInputDto,
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
      await this.patientHealthInputService.validateCreateHealthInput(
        patientId,
        calendar.id,
      );
      return await this.patientHealthInputModelService
        .create({
          ...createPatientHealthInputDto,
          patientId: patientId,
          calendarId: calendar.id,
        })
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
    } catch (error) {
      this.logService.logError('Failed to add patient health input', error);
      throw error;
    }
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get()
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async getAllPatientHealthInputsPaginated(
    @Query() queryParams: PatientHealthInputListPaginated,
  ) {
    const { patientId, sort, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.patientHealthInputModelService.findAllPaginatedAndFilter({
      skip,
      limit,
      patientId,
      sort,
    });
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  @ApiBody({
    type: UpdatePatientHealthInputDto,
  })
  @ApiParam({ name: 'id', type: String, required: true })
  async updateNote(
    @Request() req,
    @Param() params,
    @Body() dto: UpdatePatientHealthInputDto,
  ): Promise<PatientHealthInputs> {
    try {
      const input = await this.patientHealthInputService.validateAndGetPatientHealthInput(
        params.id,
      );
      const patientId =
        req.user.role === Role.PATIENT
          ? req.user.id
          : req.user.caretakersPatient.patientId;
      if (patientId !== input.patientId) {
        throw new ForbiddenException();
      }
      return this.patientHealthInputModelService.update({
        ...input,
        ...dto,
      });
    } catch (error) {
      throw error;
    }
  }
}
