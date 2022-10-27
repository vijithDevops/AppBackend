import { ResolutionType } from './../../../models/medical_alerts/entity/medical_alerts.enum';
import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  UseGuards,
  UsePipes,
  Patch,
  Request,
  BadRequestException,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { MedicalAlertsService } from './medical-alerts.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/models/user/entity/user.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateMedicalAlertDto } from './dto';
import { JoiValidationPipe } from 'src/common/validators/joi.validator';
import { UpdateMedicalAlertSchema } from './schemas/update_medical_alers.schema';
import { MedicalAlertModelService } from 'src/models/medical_alerts/medical_alerts.model.service';
import { VitalSignsModelService } from 'src/models/vital_signs/vital_signs.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { UserOrganizationAccessGuard } from 'src/common/guards/user_organizaton_access.guard';
import { PatientMedicalRiskHistoryModelService } from 'src/models/patient_medical_risk_history/patient_medical_risk_history.model.service';
import { PatientRiskHistoryChartDto } from './dto/patient_risk_history_chart.dto';
import { EventSchedulerService } from 'src/services/event-scheduler/event-scheduler.service';

@Controller('medical-alerts')
@ApiBearerAuth()
@ApiTags('Medical-Alerts')
export class MedicalAlertsController {
  constructor(
    private readonly medicalAlertsService: MedicalAlertsService,
    private readonly medicalAlertModelService: MedicalAlertModelService,
    private readonly vitalSignsModelService: VitalSignsModelService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly patientMedicalRiskHistoryModelService: PatientMedicalRiskHistoryModelService,
  ) {}

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, UserOrganizationAccessGuard)
  @Get('/settings/:organizationId')
  @ApiParam({ name: 'organizationId', type: String, required: true })
  async findOrganizationMedicalAlerts(@Param() params) {
    try {
      return await this.medicalAlertsService.findOrganizationMedicalAlertSettings(
        params.organizationId,
      );
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/settings/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Medical alert settings Id',
  })
  @UsePipes(new JoiValidationPipe(UpdateMedicalAlertSchema))
  async updateMedicalAlertsSettings(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMedicalAlertDto: UpdateMedicalAlertDto,
  ) {
    const {
      vitalSigns,
      notificationMessageTemplates,
      ...updateInputs
    } = updateMedicalAlertDto;
    try {
      const medicalAlertSettings = await this.medicalAlertModelService.validateAndFindOneById(
        id,
      );
      if (req.user.role !== Role.ADMIN) {
        if (req.user.organizationId !== medicalAlertSettings.organizationId)
          throw new ForbiddenException();
      }
      const validationPromises = [];
      if (vitalSigns) {
        validationPromises.push(
          this.medicalAlertsService.validateVitalSignsInputAndGetUpdateObject(
            vitalSigns,
          ),
        );
      }
      if (notificationMessageTemplates) {
        validationPromises.push(
          this.medicalAlertsService.validateMedicalAlertNotificationInputAndGetUpdateObject(
            notificationMessageTemplates,
          ),
        );
      }
      const [vitalsUpdateObj, notificationUpdateObj] = await Promise.all(
        validationPromises,
      );
      // update main settings
      await this.medicalAlertModelService.updateMedicalAlertSettingsById(
        medicalAlertSettings.id,
        updateInputs,
      );
      if (vitalsUpdateObj) {
        // update organization vitals
        const updateVitalsPromises = vitalsUpdateObj.map((updateObj) => {
          return this.vitalSignsModelService.createOrUpdateOrganizationVitalSign(
            updateObj.vitalSignId,
            medicalAlertSettings.organizationId,
            updateObj.updateObject,
          );
        });
        await Promise.all([...updateVitalsPromises]);
      }
      if (notificationUpdateObj) {
        // update notification templates
        const updateNotificationPromises = notificationUpdateObj.map(
          (updateObj) => {
            return this.medicalAlertModelService.createOrUpdateMedicalAlertNotificationTemplate(
              medicalAlertSettings.id,
              updateObj.eventId,
              updateObj.template,
            );
          },
        );
        await Promise.all([...updateNotificationPromises]);
      }
      if (
        !medicalAlertSettings.schedulerId ||
        (typeof updateMedicalAlertDto.isActive !== 'undefined' &&
          updateMedicalAlertDto.isActive !== medicalAlertSettings.isActive) ||
        (updateMedicalAlertDto.resolution &&
          updateMedicalAlertDto.resolution !== medicalAlertSettings.resolution)
      ) {
        // update Job in event scheduler
        this.medicalAlertsService.updateMedicalAlertScheduler(
          medicalAlertSettings.id,
        );
      }
      return {
        message: 'Success',
      };
    } catch (error) {
      throw error;
    }
    // return this.medicalAlertsService.update(+id, updateMedicalAlertDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/reset/:organizationId')
  async resetMedicalAlertSettings(
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    try {
      if (req.user.role !== Role.ADMIN) {
        if (req.user.organizationId !== organizationId)
          throw new ForbiddenException();
      }
      const medicalAlertSettings = await this.medicalAlertModelService.findOneSettingsByOrganizationId(
        organizationId,
      );
      let schedulerId = null;
      if (medicalAlertSettings.schedulerId) {
        schedulerId = medicalAlertSettings.schedulerId;
      }
      await Promise.all([
        this.vitalSignsModelService.deleteAllOrganizationVitals(organizationId),
        this.medicalAlertModelService.deleteMedicalAlertNotificationTemplates(
          medicalAlertSettings.id,
        ),
      ]);
      await this.medicalAlertModelService.deleteSettingsById(
        medicalAlertSettings.id,
      );
      if (schedulerId) {
        this.eventSchedulerService.deleteJob(schedulerId);
      }
      return await this.medicalAlertsService.findOrganizationMedicalAlertSettings(
        organizationId,
      );
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Patch('/acknowledge/:patientId')
  @ApiParam({ name: 'patientId', type: String, required: true })
  async updatePatientMedicalAcknowledgeStatus(
    @Request() req,
    @Param('patientId') patientId: string,
  ) {
    const patientMedicalRisk = await this.medicalAlertModelService.getPatientMedicalRisk(
      patientId,
    );
    if (!patientMedicalRisk) {
      throw new BadRequestException('Invalid patient Medical risk');
    }
    if (patientMedicalRisk.acknowledgeRequired) {
      await this.medicalAlertModelService.updatePatientRiskacknowledgement(
        patientId,
        req.user.id,
      );
    } else {
      throw new BadRequestException(
        'No acknowledgement required for patient vital risk',
      );
    }
    return {
      status: 200,
      message: 'SUCCESS',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/patientRiskHistoryChart')
  async findPatientHistoryRiskBypatientMedicalRiskHistoryId(
    @Query() queryParams: PatientRiskHistoryChartDto,
  ) {
    try {
      const { resolutionType, ...filterParams } = queryParams;
      const medicalRiskData = await this.patientMedicalRiskHistoryModelService.getMedicalAndVitalRiskHistory(
        filterParams,
      );
      const [dailyRisk, hourlyRisk] = [{}, {}];
      medicalRiskData.forEach((risk) => {
        if (risk.resolutionType === ResolutionType.DAILY) {
          const dateString = `${risk.startDate.getDate()}-${risk.startDate.getMonth()}-${risk.startDate.getFullYear()}T0:0:0`;
          dailyRisk[dateString] = risk;
        } else {
          const dateString = `${risk.startDate.getDate()}-${risk.startDate.getMonth()}-${risk.startDate.getFullYear()}T${risk.startDate.getHours()}:0:0`;
          hourlyRisk[dateString] = risk;
        }
      });
      const [filterStartDate, filterEndDate] = [
        new Date(filterParams.startDate),
        new Date(filterParams.endDate),
      ];
      const startDate = new Date(
        filterStartDate.getFullYear(),
        filterStartDate.getMonth(),
        filterStartDate.getDate(),
        filterStartDate.getHours(),
        0,
        0,
        0,
      );
      const endDate = new Date(
        filterEndDate.getFullYear(),
        filterEndDate.getMonth(),
        filterEndDate.getDate(),
        filterEndDate.getHours(),
        0,
        0,
        0,
      );
      const chartData = [];
      if (resolutionType === ResolutionType.HOURLY) {
        for (
          let loopDate = new Date(startDate);
          loopDate <= endDate;
          loopDate.setHours(loopDate.getHours() + 1)
        ) {
          const hourlyDateString = `${loopDate.getDate()}-${loopDate.getMonth()}-${loopDate.getFullYear()}T${loopDate.getHours()}:0:0`;
          const dailyDateString = `${loopDate.getDate()}-${loopDate.getMonth()}-${loopDate.getFullYear()}T0:0:0`;
          if (hourlyRisk[hourlyDateString]) {
            chartData.push(hourlyRisk[hourlyDateString]);
          } else if (dailyRisk[dailyDateString]) {
            chartData.push({
              ...dailyRisk[dailyDateString],
              startDate: new Date(loopDate),
              endDate: new Date(
                new Date(loopDate).setHours(loopDate.getHours() + 1),
              ),
            });
          }
        }
      } else {
        // Hourly resolution
        startDate.setHours(0);
        endDate.setHours(0);
        for (
          let loopDate = new Date(startDate);
          loopDate <= endDate;
          loopDate.setDate(loopDate.getDate() + 1)
        ) {
          const dailyDateString = `${loopDate.getDate()}-${loopDate.getMonth()}-${loopDate.getFullYear()}T0:0:0`;
          if (dailyRisk[dailyDateString]) {
            chartData.push(dailyRisk[dailyDateString]);
          } else if (hourlyRisk[dailyDateString]) {
            chartData.push({
              ...hourlyRisk[dailyDateString],
              startDate: new Date(loopDate),
              endDate: new Date(
                new Date(loopDate).setDate(loopDate.getDate() + 1),
              ),
            });
          }
        }
      }
      return {
        chartData,
      };
    } catch (error) {
      throw error;
    }
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.medicalAlertsService.remove(+id);
  // }
}
