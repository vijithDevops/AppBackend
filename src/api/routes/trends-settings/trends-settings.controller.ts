import {
  UseGuards,
  Controller,
  Request,
  Body,
  Get,
  Post,
  Put,
  Param,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import { TrendsSettings } from '../../../models/trends_settings/entity/trends_settings.entity';
import {
  TrendsSettingsModelService,
  DefaultTrendsSettingsModelService,
  UserTrendsSettingsModelService,
} from '../../../models/trends_settings/trends_settings.service';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';
import { UpdatePatientTrendsOrderDto } from './dto/update_trends_settings.dto';
import { TrendsSettingsColumnsOrderDto } from './dto/trends_settings_columns_order_dto';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('trends-settings')
@ApiTags('Trends-Settings')
@ApiBearerAuth()
export class TrendsSettingsController {
  constructor(
    private readonly trendSettingsModelService: TrendsSettingsModelService,
    private readonly defaultTrendsSettingsModelService: DefaultTrendsSettingsModelService,
    private readonly userTrendsSettingsModelService: UserTrendsSettingsModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
  ) {}
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/')
  async updateTrendsSettings(
    @Request() req,
    @Body() updatePatientTrendsOrderDto: UpdatePatientTrendsOrderDto,
  ): Promise<TrendsSettings> {
    const userId = req.user.id;

    const data = {
      ...updatePatientTrendsOrderDto,
      userId,
    };

    return await this.trendSettingsModelService.update(data);
  }
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @ApiParam({ name: 'patientId', type: String, required: true })
  @Get('/:patientId')
  async getPatientTrendSettings(
    @Param() params,
    @Request() req,
  ): Promise<TrendsSettings | any[]> {
    const userId = req.user.id;
    return await this.trendSettingsModelService.findOne(
      params.patientId,
      userId,
    );
  }
  private filterColumns(UserTS: string[], DefaultTS: string[]) {
    const FinalTS = [];
    const defaultTS = DefaultTS.slice(); // deep copy array to avoid altering original table
    UserTS.forEach((col) => {
      if (defaultTS.includes(col)) {
        FinalTS.push(col);
        defaultTS.splice(defaultTS.indexOf(col), 1);
      }
    });
    return FinalTS;
  }
  private filterColumnsStrict(UserTS: string[], DefaultTS: string[]) {
    const FinalTS = [];
    const defaultTS = DefaultTS.slice(); // deep copy array to avoid altering original table
    UserTS.forEach((col) => {
      if (defaultTS.includes(col)) {
        FinalTS.push(col);
        defaultTS.splice(defaultTS.indexOf(col), 1);
      } else {
        throw new HttpException(
          `Column '${col}' not found. Default Columns: [${DefaultTS}], Columns Left: [${defaultTS}]`,
          HttpStatus.NOT_FOUND,
        );
      }
    });
    return FinalTS;
  }

  @ApiParam({ name: 'tablename', type: String, required: true })
  @ApiQuery({ name: 'patientid', type: String, required: false })
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/table/:tablename')
  async updateTrendsSettings2(
    @Param('tablename') tablename,
    @Body() trendsSettingsColumnsOrderDto: TrendsSettingsColumnsOrderDto,
    @Query('patientid') patientid,
    @Request() req,
  ) {
    const userid = req.user.id;
    const [
      DefaultTS,
      requirePatientId,
    ] = await this.defaultTrendsSettingsModelService.findOne(tablename);
    if (DefaultTS === undefined) {
      throw new HttpException(
        `Table '${tablename}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (requirePatientId === true && patientid === undefined) {
      throw new HttpException(
        `Table '${tablename}' requires PatientId to be specified. Please ensure the key 'patientid' is found among the GET parameters.`,
        HttpStatus.NOT_FOUND,
      );
    } else if (requirePatientId === true) {
      const patient = await this.patientInfoModelService
        .findPatientInfoByUserId(patientid)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      if (patient === undefined) {
        throw new HttpException(
          `Patientid '${patientid}' is not found. Please ensure patientid is of a valid patient.`,
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      // if ( requirePatientId === false ) {
      patientid = null; // db sentinel value
    }
    const columnsOrder = trendsSettingsColumnsOrderDto['columnsOrder'];
    const UserTSId = await this.userTrendsSettingsModelService.findOneId(
      userid,
      tablename,
      patientid,
    );
    const FinalTS = this.filterColumnsStrict(columnsOrder, DefaultTS);
    if (UserTSId === undefined) {
      return this.userTrendsSettingsModelService.create({
        userId: userid,
        tableName: tablename,
        patientId: patientid,
        columnsOrder: FinalTS,
      });
    } else {
      return this.userTrendsSettingsModelService.update(UserTSId, {
        userId: userid,
        tableName: tablename,
        patientId: patientid,
        columnsOrder: FinalTS,
      });
    }
  }

  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'tablename', type: String, required: true })
  @ApiQuery({ name: 'patientid', type: String, required: false })
  @Get('/table/:tablename')
  async findTrendsSettings2(
    @Param('tablename') tablename,
    @Query('patientid') patientid,
    @Request() req,
  ) {
    const userid = req.user.id;
    const [
      DefaultTS,
      requirePatientId,
    ] = await this.defaultTrendsSettingsModelService.findOne(tablename);
    if (DefaultTS === undefined) {
      throw new HttpException(
        `Table '${tablename}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (requirePatientId === true && patientid === undefined) {
      throw new HttpException(
        `Table '${tablename}' requires PatientId to be specified. Please ensure the key 'patientid' is found among the GET parameters.`,
        HttpStatus.NOT_FOUND,
      );
    } else if (requirePatientId === true) {
      const patient = await this.patientInfoModelService
        .findPatientInfoByUserId(patientid)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      if (patient === undefined) {
        throw new HttpException(
          `Patientid '${patientid}' is not found. Please ensure patientid is of a valid patient.`,
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      // if ( requirePatientId === false ) {
      patientid = null; // db sentinel value
    }
    const UserTS = await this.userTrendsSettingsModelService.findOneCol(
      userid,
      tablename,
      patientid,
    );
    if (UserTS === undefined) {
      return {
        userColumnsOrder: DefaultTS,
        defaultColumnsOrder: DefaultTS,
      };
    } else {
      return {
        userColumnsOrder: this.filterColumns(UserTS, DefaultTS),
        defaultColumnsOrder: DefaultTS,
      };
    }
  }
}
