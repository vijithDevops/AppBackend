import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/models/user/entity/user.enum';
import { BreathingExercisePrescriptionService } from './breathing-exercise-prescription.service';
import {
  CreateBreathingExercisePrescriptionDto,
  UpdateBreathingExercisePrescriptionDto,
  BreathingExercisePrescriptionListPaginated,
  BreathingRecordsPaginated,
  BreathingRecordsResponseDto,
} from './dto';
import { BreatingExercisePrescription } from '../../../models/breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { getPagination } from 'src/common/utils/entity_metadata';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { BreatingExercisePrescriptionModelService } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import { PatientBreathingInputModelService } from '../../../models/patient_breathing_input/patient_breathing_input.model.service';
import { OrganizationPatientResourceGuard } from '../../../common/guards/organization_patient_resource.guard';

@Controller('breathing-exercise-prescription')
@ApiBearerAuth()
@ApiTags('Breathing-exercise-Prescription')
export class BreathingExercisePrescriptionController {
  constructor(
    private readonly breathingExercisePrescriptionService: BreathingExercisePrescriptionService,
    private readonly breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
    private readonly patientBreathingInputModelService: PatientBreathingInputModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post()
  async create(
    @Body()
    createBreathingExercisePrescriptionDto: CreateBreathingExercisePrescriptionDto,
  ): Promise<BreatingExercisePrescription> {
    try {
      const prescriptionData = {
        ...createBreathingExercisePrescriptionDto,
        calendarId: (
          await this.calendarModelService.getCalendarDate(
            new Date(createBreathingExercisePrescriptionDto.startDate),
          )
        ).id,
      };
      return await this.breatingExercisePrescriptionModelService.create(
        prescriptionData,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Put(':id/:patientId')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({ name: 'patientId', type: String, required: true })
  async update(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
    @Body()
    updateBreathingExercisePrescriptionDto: UpdateBreathingExercisePrescriptionDto,
  ) {
    try {
      await this.breathingExercisePrescriptionService.validateAndGetBreathingExercisePrescription(
        id,
        patientId,
      );
      const updatePrescriptionData = {
        ...updateBreathingExercisePrescriptionDto,
        id: id,
      };
      if (updateBreathingExercisePrescriptionDto.startDate) {
        updatePrescriptionData['calendarId'] = (
          await this.calendarModelService.getCalendarDate(
            new Date(updateBreathingExercisePrescriptionDto.startDate),
          )
        ).id;
      }
      return this.breatingExercisePrescriptionModelService.update(
        updatePrescriptionData,
      );
      // TODO: Enable reminders if disabled
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/')
  async getAllMedicationPrescriptionPaginated(
    @Query() queryParams: BreathingExercisePrescriptionListPaginated,
  ) {
    try {
      const { patientId, isValid, sort, ...paginateParams } = queryParams;
      const { limit, skip } = getPagination(paginateParams);
      return await this.breatingExercisePrescriptionModelService.findAllPaginatedAndFilter(
        {
          skip,
          limit,
          patientId,
          isValid:
            isValid === 'true' ? true : isValid === 'false' ? false : null,
          sort,
        },
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Delete('/:id/:patientId')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({ name: 'patientId', type: String, required: true })
  async delete(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
  ): Promise<void> {
    try {
      await this.breathingExercisePrescriptionService.validateAndGetBreathingExercisePrescription(
        id,
        patientId,
      );
      return await this.breatingExercisePrescriptionModelService.softDelete(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOkResponse({
    type: BreathingRecordsResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/records/:prescriptionId')
  @ApiParam({ name: 'prescriptionId', type: String, required: true })
  async getPatientMedicationRecordsPaginated(
    @Param() params,
    @Query() queryParams: BreathingRecordsPaginated,
  ) {
    try {
      const { patientId, ...paginateParams } = queryParams;
      const { limit, skip } = getPagination(paginateParams);
      const prescription = await this.breathingExercisePrescriptionService.validateAndGetBreathingExercisePrescription(
        params.prescriptionId,
        patientId,
      );
      const {
        data,
        totalCount,
      } = await this.patientBreathingInputModelService.getBreathingRecordsPaginated(
        prescription.id,
        {
          skip,
          limit,
        },
      );
      return {
        prescription,
        records: data,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }
}
