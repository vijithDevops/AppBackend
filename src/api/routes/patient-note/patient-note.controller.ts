import {
  UseGuards,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Request,
  Controller,
  Patch,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiParam, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PatientNoteService } from './patient-note.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PatientNote } from '../../../models/patient_note/entity/patient_note.entity';
import {
  CreatePatientNoteDto,
  UpdatePatientNoteDto,
  PatientNotesListPaginated,
} from './dto/';
import { getPagination } from '../../../common/utils/entity_metadata';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import { ICreatePatientNote } from '../../../models/patient_note/interfaces';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { PatientNoteModelService } from '../../../models/patient_note/patient_note.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { PatientSupervisionMappingModelService } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('patient-note')
@ApiTags('Patient-Note')
@ApiBearerAuth()
export class PatientNoteController {
  constructor(
    private readonly patientNoteService: PatientNoteService,
    private readonly patientNoteModelService: PatientNoteModelService,
    private readonly calendarModelService: CalendarModelService,
    private readonly patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
  ) {}

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async createNote(
    @Request() req,
    @Body() createPatientNoteDto: CreatePatientNoteDto,
  ): Promise<PatientNote> {
    const patientId =
      req.user.role === Role.PATIENT
        ? req.user.id
        : req.user.caretakersPatient.patientId;
    if (!patientId) {
      throw new ForbiddenException();
    }
    let noteData: ICreatePatientNote = {
      ...createPatientNoteDto,
      patientId: patientId,
      calendarId: (await this.calendarModelService.getCalendarDate(new Date()))
        .id,
    };
    const doctorInCharge = await this.patientSupervisionMappingModelService.getDoctorInCharge(
      patientId,
    );
    if (doctorInCharge) {
      noteData = { ...noteData, doctorId: doctorInCharge.userId };
    }

    return await this.patientNoteModelService.create(noteData);
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateNote(
    @Request() req,
    @Param() params,
    @Body() updatePatientNoteDto: UpdatePatientNoteDto,
  ): Promise<PatientNote> {
    try {
      await this.patientNoteService.validatePatientNotesAndCheckReqUserAccess(
        params.id,
        req.user,
      );
      const updateNoteData = {
        id: params.id,
        ...updatePatientNoteDto,
      };
      return this.patientNoteModelService.update(updateNoteData);
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
  async getAllPatientNotesPaginated(
    @Query() queryParams: PatientNotesListPaginated,
  ) {
    const { page, perPage, patientId, ...filterOptions } = queryParams;
    const { skip, limit } = getPagination({ page, perPage });
    return await this.patientNoteModelService.findAllPatientNotesPaginated(
      {
        skip,
        limit,
        ...filterOptions,
      },
      patientId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async getNote(@Request() req, @Param() params): Promise<PatientNote> {
    const patientNote = await this.patientNoteModelService.findOne(params.id);
    if (!patientNote) {
      throw new HttpException('Invalid patient note', HttpStatus.BAD_REQUEST);
    }
    if (
      req.user.role !== Role.ADMIN &&
      patientNote.patient.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException();
    }
    return patientNote;
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteNote(@Request() req, @Param() params): Promise<void> {
    try {
      await this.patientNoteService.validatePatientNotesAndCheckReqUserAccess(
        params.id,
        req.user,
      );
      return await this.patientNoteModelService.softDelete(params.id);
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/read/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateReadStatus(@Request() req, @Param() params): Promise<void> {
    const patientNotes = await this.patientNoteModelService.findOne(params.id);
    if (!patientNotes) {
      throw new HttpException('Invalid patient note', HttpStatus.BAD_REQUEST);
    }
    if (
      req.user.role !== Role.ADMIN &&
      patientNotes.patient.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException();
    }
    if (patientNotes.doctorId === req.user.id && !patientNotes.doctorReadAt) {
      await this.patientNoteModelService.updateReadTime(patientNotes.id);
    }
  }
}
