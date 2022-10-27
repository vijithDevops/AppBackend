import {
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Query,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { MedicationPrescriptionService } from './medication-prescription.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import {
  CreateMedicationPrescriptionDto,
  UpdateMedicationPrescriptionDto,
  MedicationPrescriptionListPaginated,
  MedicationRecordsPaginated,
  MedicationRecordsResponseDto,
} from './dto';
import { MedicationPrescription } from '../../../models/medication_prescription/entity/medication_prescription.entity';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { getPagination } from '../../../common/utils/entity_metadata';
import { MedicationPrescriptionModelService } from '../../../models/medication_prescription/medication_prescription.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { PatientMedicationInputModelService } from '../../../models/patient_medication_input/patient_medication_input.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('medication-prescription')
@ApiBearerAuth()
@ApiTags('Medication-Prescription')
export class MedicationPrescriptionController {
  constructor(
    private readonly medicationPrescriptionService: MedicationPrescriptionService,
    private readonly medicationPrescriptionModelService: MedicationPrescriptionModelService,
    private readonly patientMedicationInputModelService: PatientMedicationInputModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/')
  async create(
    @Body() createMedicationPrescriptionDto: CreateMedicationPrescriptionDto,
  ): Promise<MedicationPrescription> {
    const prescriptionData = {
      ...createMedicationPrescriptionDto,
      totalDosagePerDay:
        createMedicationPrescriptionDto.dosePerIntake &&
        createMedicationPrescriptionDto.intakeFrequencyPerDay
          ? createMedicationPrescriptionDto.dosePerIntake *
            createMedicationPrescriptionDto.intakeFrequencyPerDay
          : null,
      calendarId: (await this.calendarModelService.getCalendarDate(new Date()))
        .id,
    };
    return await this.medicationPrescriptionModelService.create(
      prescriptionData,
    );
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Put('/:id/:patientId')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({ name: 'patientId', type: String, required: true })
  async update(
    @Param() params,
    @Body() updateMedicationPrescriptionDto: UpdateMedicationPrescriptionDto,
  ): Promise<MedicationPrescription> {
    await this.medicationPrescriptionService.validateAndGetMedicationPrescription(
      params.id,
      params.patientId,
    );
    const updatePrescriptionData = {
      ...updateMedicationPrescriptionDto,
      ...(updateMedicationPrescriptionDto.intakeFrequencyPerDay &&
        updateMedicationPrescriptionDto.dosePerIntake && {
          totalDosagePerDay:
            updateMedicationPrescriptionDto.intakeFrequencyPerDay *
            updateMedicationPrescriptionDto.dosePerIntake,
        }),
      id: params.id,
    };
    return this.medicationPrescriptionModelService.update(
      updatePrescriptionData,
    );
    // TODO: Enable reminders if disabled
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
      await this.medicationPrescriptionService.validateAndGetMedicationPrescription(
        id,
        patientId,
      );
      return await this.medicationPrescriptionModelService.softDelete(id);
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
    @Request() req,
    @Query() queryParams: MedicationPrescriptionListPaginated,
  ) {
    const {
      patientId,
      search,
      consumeDate,
      date,
      isValid,
      isActive,
      sort,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.medicationPrescriptionModelService.findAllPaginatedAndFilter(
      {
        skip,
        limit,
        patientId,
        search,
        consumeDate,
        date,
        isValid: isValid === 'true' ? true : isValid === 'false' ? false : null,
        isActive:
          req.user.role === Role.PATIENT || req.user.role === Role.CARETAKER
            ? true
            : isActive === 'true'
            ? true
            : isActive === 'false'
            ? false
            : null,
        sort,
      },
    );
  }

  @ApiOkResponse({
    type: MedicationRecordsResponseDto,
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
    @Query() queryParams: MedicationRecordsPaginated,
  ) {
    try {
      const { patientId, ...paginateParams } = queryParams;
      const { limit, skip } = getPagination(paginateParams);
      const prescription = await this.medicationPrescriptionService.validateAndGetMedicationPrescription(
        params.prescriptionId,
        patientId,
      );
      const {
        data,
        totalCount,
      } = await this.patientMedicationInputModelService.getMedicationRecordsPaginated(
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
