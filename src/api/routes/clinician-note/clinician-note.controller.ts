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
  UsePipes,
  HttpException,
  HttpStatus,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { ApiParam, ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

import { ClinicianNoteService } from './clinician-note.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ClinicianNote } from '../../../models/clinician_note/entity/clinician_note.entity';
import {
  CreateClinicianNoteDto,
  UpdateClinicianNoteDto,
  ClinicianNotesListPaginated,
} from './dto/';
import { JoiValidationPipe } from '../../../common/validators/joi.validator';
import { CreateClinicianNoteSchema } from './schema/create-clinician-note.schema';
import { getPagination } from '../../../common/utils/entity_metadata';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { UserModelService } from '../../../models/user/user.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { ClinicianNoteModelService } from '../../../models/clinician_note/clinician_note.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('clinician-note')
@ApiBearerAuth()
@ApiTags('Clinician-Notes')
export class ClinicianNoteController {
  constructor(
    private readonly clinicianNoteService: ClinicianNoteService,
    private readonly clinicianNoteModelService: ClinicianNoteModelService,
    private readonly calendarModelService: CalendarModelService,
    private readonly userModelService: UserModelService,
  ) {}

  @Roles(Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/')
  @UsePipes(new JoiValidationPipe(CreateClinicianNoteSchema))
  async createNote(
    @Request() req,
    @Body() createClinicianNoteDto: CreateClinicianNoteDto,
  ): Promise<ClinicianNote> {
    const patient = await this.userModelService.findOne(
      createClinicianNoteDto.patientId,
      Role.PATIENT,
    );
    if (!patient) {
      throw new HttpException('Invalid patient id', HttpStatus.BAD_REQUEST);
    }
    const noteData = {
      ...createClinicianNoteDto,
      doctorId: req.user.id,
      calendarId: (await this.calendarModelService.getCalendarDate(new Date()))
        .id,
    };
    const note = await this.clinicianNoteModelService.create(noteData);
    this.clinicianNoteService.sendNotificationToPatient(note);
    return note;
  }

  @Roles(Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateNote(
    @Request() req,
    @Param() params,
    @Body() updateClinicianNoteDto: UpdateClinicianNoteDto,
  ): Promise<ClinicianNote> {
    await this.clinicianNoteService.validateAndGetClinicianNote(
      params.id,
      req.user.id,
    );
    if (updateClinicianNoteDto.isReminder == false) {
      updateClinicianNoteDto.reminderAt = null;
    }
    const updateNoteData = {
      id: params.id,
      ...updateClinicianNoteDto,
    };
    return this.clinicianNoteModelService.update(updateNoteData);
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/')
  async getAllClinicianNotesPaginated(
    @Query() queryParams: ClinicianNotesListPaginated,
  ) {
    const { patientId, page, perPage, ...filterOptions } = queryParams;
    const { skip, limit } = getPagination({ page, perPage });
    return await this.clinicianNoteModelService.findAllClinicianNotesPaginated(
      {
        skip,
        limit,
        ...filterOptions,
      },
      patientId,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async getNote(@Param() params): Promise<ClinicianNote> {
    return await this.clinicianNoteModelService.findOne(params.id);
  }

  @Roles(Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteNote(@Request() req, @Param() params): Promise<void> {
    await this.clinicianNoteService.validateAndGetClinicianNote(
      params.id,
      req.user.id,
    );
    return await this.clinicianNoteModelService.softDelete(params.id);
  }

  @Roles(Role.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/read/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateReadStatus(@Request() req, @Param() params): Promise<void> {
    const clinicianNote = await this.clinicianNoteModelService.findOne(
      params.id,
    );
    if (clinicianNote.patientId !== req.user.id) {
      throw new ForbiddenException();
    }
    if (!clinicianNote.patientReadAt) {
      await this.clinicianNoteModelService.updateReadTime(clinicianNote.id);
    }
  }
}
