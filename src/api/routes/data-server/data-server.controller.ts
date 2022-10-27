import { Role } from 'src/models/user/entity/user.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Param,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiSecurity,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientAlertSettings } from 'src/models/patient_alert_settings/entity/patient_alert_settings.entity';
import { DataServerService } from './data-server.service';
import {
  FindPatientAlertSettingsByPatientIdIntDto,
  PatientAlertSettingsResponseDto,
  SendAlertNotificationDto,
  GetPatientComplianceCalendarForDataServerDto,
  DataServerPatientComplianceCalendarResponseDto,
  FindPatientDevicesByPatientIdIntDto,
  patientDevicesResponseDto,
} from './dto';
import { PatientAlertSettingsModelService } from '../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { DataServerAuthGuard } from 'src/common/guards/data_server_auth.guard';
import { CalendarService } from '../calendar/calendar.service';
import { PatientAlertService } from '../../../services/patient-alerts/patient-alert.service';
import { GatewayModelService } from '../../../models/gateway/gateway.model.service';
import { SensorModelService } from '../../../models/sensor/sensor.model.service';
import { GatewayDetailsResponseDto } from '../gateway/dto/responses/gateway_details.response.dto';
import { SensorDetailsResponseDto } from '../sensor/dto/responses/sensor_details.response.dto';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';
import { PatientInfoResponseDto } from './dto/responses/patient_info.response.dto';
import { UserTokenVerifyResponseDto } from './dto/responses/user_token_verify_response.dto';

@Controller('data-server')
@ApiSecurity('server-auth-key')
@ApiBearerAuth()
@ApiTags('Data Prosessing Server APIs')
export class DataServerController {
  constructor(
    private readonly dataServerService: DataServerService,
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly calendarService: CalendarService,
    private readonly patientAlertService: PatientAlertService,
    private readonly gatewayModelService: GatewayModelService,
    private readonly sensorModelService: SensorModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
  ) {}

  @Get('/patientIds')
  @ApiOperation({
    description: 'API to get all active patietn Ids',
  })
  @UseGuards(DataServerAuthGuard)
  async getAllPatietnIds() {
    return await this.patientInfoModelService.getAllActivePatientIds();
  }

  @Get('/patient-alert-settings')
  @ApiOperation({
    description: 'API to get patient alert settings values',
  })
  @ApiOkResponse({
    type: PatientAlertSettingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs when the pateintId is invalid',
  })
  @UseGuards(DataServerAuthGuard)
  async getPatientAlertSettings(
    @Query() queryParams: FindPatientAlertSettingsByPatientIdIntDto,
  ): Promise<PatientAlertSettings> {
    const patient = await this.dataServerService.validateAndGetPatientByPatientIdInt(
      queryParams.patientIdInt,
    );
    return await this.patientAlertSettingsModelService.findByPatientId(
      patient.id,
    );
  }

  @ApiBody({
    type: SendAlertNotificationDto,
    description:
      'Send Alert notifications to patient careteam about patient medical condition',
  })
  @UseGuards(DataServerAuthGuard)
  @Post('/alert-notification')
  async sendMessageNotification(
    @Body() sendNotificationDto: SendAlertNotificationDto,
  ) {
    try {
      const patient = await this.dataServerService.validateAndGetPatientByPatientIdInt(
        sendNotificationDto.patientIdInt,
      );
      this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
        patient,
        sendNotificationDto.alertType,
        sendNotificationDto.biomarker,
      );
      return {
        status: 200,
        message: 'Alerts send successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // render onBoardDate
  @ApiOperation({
    description: 'API to get patient compliance calendar',
  })
  @ApiOkResponse({
    type: DataServerPatientComplianceCalendarResponseDto,
  })
  @UseGuards(DataServerAuthGuard)
  @Get('/patient-compliance/monthly-details')
  async getPatientComplianceMonthlyCalendarDetails(
    @Query()
    complianceCalendarDto: GetPatientComplianceCalendarForDataServerDto,
  ) {
    try {
      const patient = await this.dataServerService.validateAndGetPatientByPatientIdInt(
        complianceCalendarDto.patientIdInt,
      );
      if (!patient) {
        throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
      }
      const queryDate = complianceCalendarDto.date
        ? new Date(complianceCalendarDto.date)
        : new Date();
      return {
        onBoardDate: patient.createdAt,
        ...(await this.calendarService
          .getPatientComplianceMonthlyCalendarEvents(patient, queryDate)
          .catch((err) => {
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
          })),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/patient-devices')
  @ApiOperation({
    description: 'API to get details of patient Gateways and Sensors',
  })
  @ApiOkResponse({
    type: patientDevicesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs when the pateintId is invalid',
  })
  @UseGuards(DataServerAuthGuard)
  async getPatientDevices(
    @Query() queryParams: FindPatientDevicesByPatientIdIntDto,
  ) {
    await this.dataServerService.validateAndGetPatientByPatientIdInt(
      queryParams.patientIdInt,
    );
    return {
      sensors: await this.sensorModelService.findByPatientId(
        queryParams.patientIdInt,
      ),
      gateways: await this.gatewayModelService.findByPatientId(
        queryParams.patientIdInt,
      ),
    };
  }

  @Get('/gateway/:macId')
  @ApiOperation({
    description: 'API to get Gateway details by macId',
  })
  @ApiOkResponse({
    type: GatewayDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs for invalid Gateway MacId',
  })
  @UseGuards(DataServerAuthGuard)
  @ApiParam({ name: 'macId', type: String, required: true })
  async findGatewayDetails(@Param('macId') macId: string) {
    const gatewayDetails = await this.gatewayModelService.findOneDetailsByMacId(
      macId,
    );
    if (!gatewayDetails) {
      throw new HttpException('Invalid Gateway MacId', HttpStatus.BAD_REQUEST);
    }
    return gatewayDetails;
  }

  @Get('/sensor/:macId')
  @ApiOperation({
    description: 'API to get Sensor details by macId',
  })
  @ApiOkResponse({
    type: SensorDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs for invalid Sensor MacId',
  })
  @UseGuards(DataServerAuthGuard)
  @ApiParam({ name: 'macId', type: String, required: true })
  async findSensorDetails(@Param('macId') macId: string) {
    const sensorDetails = await this.sensorModelService.findOneDetailsByMacId(
      macId,
    );
    if (!sensorDetails) {
      throw new HttpException('Invalid Sensor MacId', HttpStatus.BAD_REQUEST);
    }
    return sensorDetails;
  }

  @Get('/patient-details/:patientIdInt')
  @ApiOperation({
    description: 'API to get patient details by patientId int',
  })
  @ApiOkResponse({
    type: PatientInfoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Occurs for invalid patient integer Id',
  })
  @UseGuards(DataServerAuthGuard)
  @ApiParam({ name: 'patientIdInt', type: Number, required: true })
  async getPatientDetails(@Param('patientIdInt') patientIdInt: number) {
    const patietnInfo = await this.patientInfoModelService.getPatientInfoByIntId(
      patientIdInt,
    );
    if (!patietnInfo) {
      throw new BadRequestException(' Invalid patient Integer Id');
    }
    return patietnInfo;
  }

  @Get('/verify/user')
  @ApiOperation({
    description:
      'API to verify user AUTH token. User the Authorization header to pass the Bearer token',
  })
  @ApiOkResponse({
    type: UserTokenVerifyResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Occurs for invalid Bearer tokens',
  })
  @UseGuards(JwtAuthGuard)
  async verifyUserAuthToken(@Request() req) {
    const user = req.user;
    return {
      username: user.username,
      role: user.role,
      patientId: user.role === Role.PATIENT ? user.patientInfo.patientId : null,
    };
  }
}
