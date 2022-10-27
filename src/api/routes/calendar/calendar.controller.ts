import {
  Controller,
  Get,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { CalendarService } from '../calendar/calendar.service';
import { UserResourceGuard } from '../../../common/guards/user_resource.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GetCalendarDto } from './dto/get_calendar.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserModelService } from '../../../models/user/user.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import {
  GetCalendarResponseDto,
  GetPatientComplianceCalendarDto,
  GetPatientSymptomsDto,
  MonthlyCalendarResponseDto,
  PatientComplianceCalendarResponseDto,
  PatientSymptomsResponseDto,
} from './dto';
import { Role } from 'src/models/user/entity/user.enum';
import { JoiValidationPipe } from 'src/common/validators/joi.validator';
import { GetPatientSymptomsFilterSchema } from './schemas/get_patient_symptoms_filter';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { OrganizationUserResourceGuard } from 'src/common/guards/organization_user_resource.guard';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('calendar')
@ApiTags('Calendar')
@ApiBearerAuth()
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly userModelService: UserModelService,
    private readonly calendarModelService: CalendarModelService,
  ) {}

  @ApiOperation({
    description:
      'API to get calendar events for a single data (Todays date is set to default)',
  })
  @ApiOkResponse({
    type: GetCalendarResponseDto,
  })
  @UseGuards(JwtAuthGuard, UserResourceGuard, OrganizationUserResourceGuard)
  @Get('/')
  async getCalendarDetails(@Query() getCalendarDto: GetCalendarDto) {
    const queryDate = getCalendarDto.date
      ? new Date(getCalendarDto.date)
      : new Date();
    const [user, calendar] = await Promise.all([
      this.userModelService.findOne(getCalendarDto.userId).catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      }),
      await this.calendarModelService.getCalendarDate(queryDate),
    ]);
    return await this.calendarModelService
      .getCalendarDetails(user.id, user.role, calendar.id)
      .catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });
  }

  @ApiOperation({
    description: 'API to get calendar events for a single data',
  })
  @ApiOkResponse({
    type: MonthlyCalendarResponseDto,
  })
  @UseGuards(JwtAuthGuard, UserResourceGuard, OrganizationUserResourceGuard)
  @Get('/monthly-details')
  async getMonthlyCalendarDetails(@Query() getCalendarDto: GetCalendarDto) {
    const user = await this.userModelService
      .findOne(getCalendarDto.userId)
      .catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });
    const queryDate = getCalendarDto.date
      ? new Date(getCalendarDto.date)
      : new Date();
    return {
      calendarData: await this.calendarService
        .getUserMonthlyCalendarEvents(user, queryDate)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }),
      alerts: await this.calendarService.getUserMonthlyCalendarAlerData(
        user,
        queryDate,
      ),
    };
  }

  @ApiOperation({
    description: 'API to get patient compliance calendar',
  })
  @ApiOkResponse({
    type: PatientComplianceCalendarResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/patient-compliance/monthly-details')
  async getPatientComplianceMonthlyCalendarDetails(
    @Query() complianceCalendarDto: GetPatientComplianceCalendarDto,
  ) {
    try {
      const user = await this.userModelService.findOneById(
        complianceCalendarDto.patientId,
        Role.PATIENT,
      );
      if (!user) {
        throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
      }
      const queryDate = complianceCalendarDto.date
        ? new Date(complianceCalendarDto.date)
        : new Date();
      return await this.calendarService
        .getPatientComplianceMonthlyCalendarEvents(user, queryDate)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    description: 'API to get patient Symptoms details between dates',
  })
  @ApiOkResponse({
    type: PatientSymptomsResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @UsePipes(new JoiValidationPipe(GetPatientSymptomsFilterSchema))
  @Get('/patient-symptoms')
  async getPatientSymptomsDetailsBetweenDates(
    @Query() patientSymptomsDto: GetPatientSymptomsDto,
  ) {
    try {
      const { patientId, startDate, endDate } = patientSymptomsDto;
      const patient = await this.userModelService
        .validateAndGetPatientByUserId(patientId)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      return await this.calendarService.getPatientSymptomScoresBetweenDates(
        patient.id,
        startDate,
        endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    description: 'API to get patient questionnaire input details between dates',
  })
  @ApiOkResponse({
    type: PatientSymptomsResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @UsePipes(new JoiValidationPipe(GetPatientSymptomsFilterSchema))
  @Get('/patient-symptoms/v2')
  async getPatientQuestionnaireInputDetailsBetweenDates(
    @Query() patientQuestionnaireInputDto: GetPatientSymptomsDto,
  ) {
    try {
      const { patientId, startDate, endDate } = patientQuestionnaireInputDto;
      const patient = await this.userModelService
        .validateAndGetPatientByUserId(patientId)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      return await this.calendarService.getPatientQuestionnaireInputScoresBetweenDates(
        patient.id,
        startDate,
        endDate,
      );
    } catch (error) {
      throw error;
    }
  }
}
