import {
  UseGuards,
  Body,
  Get,
  Controller,
  Query,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PatientAlertSettingsService } from './patient-alert-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  UpdatePatientAlertSettingsDto,
  FindPatientAlertSettingsDto,
  ResetDefaultPatientAlertSettingsDto,
} from './dto/';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import { PatientAlertSettingsModelService } from '../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { MedicalAlertsService } from '../medical-alerts/medical-alerts.service';
import { VitalSignsModelService } from 'src/models/vital_signs/vital_signs.model.service';
import { PatientAlertSettingsResponseDto } from './dto/responses/patient_alert_settings.response.dto';

@Controller('patient-alert-settings')
@ApiTags('Patient-Alert-Settings')
@ApiBearerAuth()
export class PatientAlertSettingsController {
  constructor(
    private readonly patientAlertSettingsService: PatientAlertSettingsService,
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly medicalAlertsService: MedicalAlertsService,
    private vitalSignsModelService: VitalSignsModelService,
  ) {}

  // @Roles(Role.DOCTOR)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('/')
  // async createPatientAlertSettings(
  //   @Body()
  //   createPatientAlertSettingsDto: UpdatePatientAlertSettingsDto,
  // ): Promise<PatientAlertSettings> {
  //   const alertSettingsData = {
  //     ...createPatientAlertSettingsDto,
  //   };
  //   return await this.patientAlertSettingsModelService.create(
  //     alertSettingsData,
  //   );
  // }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Patch('/')
  async updatePatientAlertSetting(
    @Body()
    updatePatientAlertSettingDto: UpdatePatientAlertSettingsDto,
  ): Promise<PatientAlertSettingsResponseDto> {
    await this.patientAlertSettingsService.validatePatientId(
      updatePatientAlertSettingDto.patientId,
    );
    let vitalsUpdateObject;
    if (updatePatientAlertSettingDto.vitalSigns) {
      vitalsUpdateObject = await this.medicalAlertsService.validateVitalSignsInputAndGetUpdateObject(
        updatePatientAlertSettingDto.vitalSigns,
      );
    }
    const updatedAlertSettings = await this.patientAlertSettingsService.update(
      updatePatientAlertSettingDto,
    );
    if (vitalsUpdateObject) {
      // update organization vitals
      const updateVitalsPromises = vitalsUpdateObject.map((updateObj) => {
        return this.vitalSignsModelService.createOrUpdatePatientVitalSign(
          updateObj.vitalSignId,
          updatePatientAlertSettingDto.patientId,
          updateObj.updateObject,
        );
      });
      await Promise.all([...updateVitalsPromises]);
    }
    return {
      ...updatedAlertSettings,
      vitalSigns: await this.vitalSignsModelService.getPatientVitalSignsObject(
        updatePatientAlertSettingDto.patientId,
      ),
    };
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/')
  async getPatientAlertSettings(
    @Query() queryParams: FindPatientAlertSettingsDto,
  ): Promise<PatientAlertSettingsResponseDto> {
    await this.patientAlertSettingsService.validatePatientId(
      queryParams.patientId,
    );
    return await this.patientAlertSettingsService.getAllPatientAlertSettings(
      queryParams.patientId,
    );
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/reset-default')
  async resetPatientAlertSetting(
    @Body()
    dto: ResetDefaultPatientAlertSettingsDto,
  ): Promise<PatientAlertSettingsResponseDto> {
    try {
      await this.patientAlertSettingsService.validatePatientId(dto.patientId);
      await Promise.all([
        this.vitalSignsModelService.deleteAllPatientVitals(dto.patientId),
        this.patientAlertSettingsModelService.deleteByPatientId(dto.patientId),
      ]);
      return await this.patientAlertSettingsService.getAllPatientAlertSettings(
        dto.patientId,
      );
    } catch (error) {
      throw error;
    }
  }
}
