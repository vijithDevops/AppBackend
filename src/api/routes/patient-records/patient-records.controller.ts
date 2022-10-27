import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PatientRecordsService } from './patient-records.service';
import { Role } from 'src/models/user/entity/user.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PatientRecordType } from 'src/models/patient_records/entity/patient_record.enum';
import { PatientRecordModelService } from 'src/models/patient_records/patient_record.model.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { getPagination } from 'src/common/utils/entity_metadata';
import {
  CreatePatientRecordDto,
  PatientRecordsListPaginated,
  CreatePatientRecordResponseDto,
} from './dto';
import { FileModelService } from '../../../models/file/file.model.service';
import { PatientRecord } from '../../../models/patient_records/entity/patient_record.entity';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { UserModelService } from '../../../models/user/user.model.service';

@Controller('patient-records')
@ApiTags('Patient-Records')
@ApiBearerAuth()
export class PatientRecordsController {
  constructor(
    private readonly patientRecordsService: PatientRecordsService,
    private readonly patientRecordModelService: PatientRecordModelService,
    private readonly fileModelService: FileModelService,
    private readonly userModelService: UserModelService,
  ) {}

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @ApiOkResponse({
    type: CreatePatientRecordResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs when any of the id in fileIds array is invalid',
  })
  @ApiBody({
    type: CreatePatientRecordDto,
    description: 'Body parameters for creating patient records',
  })
  @Post()
  async create(
    @Body() createPatientRecordDto: CreatePatientRecordDto,
  ): Promise<PatientRecord[]> {
    const patient = await this.userModelService.findOneById(
      createPatientRecordDto.patientId,
      Role.PATIENT,
    );
    if (!patient) {
      throw new HttpException('Invalid Patient', HttpStatus.BAD_REQUEST);
    }
    switch (createPatientRecordDto.type) {
      case PatientRecordType.FILE:
        return await this.patientRecordsService.createPatientRecordFiles(
          patient,
          createPatientRecordDto.fileIds,
        );
      case PatientRecordType.BREATHING_EXERCISE:
      case PatientRecordType.MEDICATION:
        return await this.patientRecordModelService.createMany([
          {
            patientId: createPatientRecordDto.patientId,
            type: createPatientRecordDto.type,
            description: createPatientRecordDto.description,
          },
        ]);
    }
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get()
  async getAllPatientRecordsPaginated(
    @Query() queryParams: PatientRecordsListPaginated,
  ) {
    const { patientId, type, sort, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.patientRecordModelService.findAllPatientRecordsPaginated(
      patientId,
      {
        skip,
        limit,
        type,
        sort,
      },
    );
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'id of the patient record',
  })
  async softDelete(@Request() req, @Param('id') id: string) {
    const record = await this.patientRecordModelService.findOne(id);
    if (!record) {
      throw new HttpException(
        'Invalid pateint record id',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      req.user.role !== Role.ADMIN &&
      record.patient.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException();
    }
    await this.patientRecordModelService.softDelete(id);
    if (record.type === PatientRecordType.FILE) {
      this.fileModelService.softDelete(record.fileId);
    }
  }
}
