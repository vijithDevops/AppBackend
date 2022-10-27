import {
  Get,
  Put,
  Delete,
  Post,
  UseGuards,
  Param,
  Body,
  Query,
  Controller,
  HttpException,
  HttpStatus,
  BadRequestException,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import {
  CreateGatewayDto,
  UpdateGatewayDto,
  GatewaysListPaginated,
  AssignGatewayPatientDto,
  PairSensorDto,
  UpdateGatewayMqttDto,
  AvailableGatewaysListPaginated,
  RegisterPatientGatewayDto,
  UpdateAppGatewayDto,
} from './dto';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { GatewayGuard } from '../../../common/guards/gateway.guard';
import { MqttServiceGuard } from '../../../common/guards/mqtt_service.guard';
import { getPagination } from '../../../common/utils/entity_metadata';
import { GatewayModelService } from '../../../models/gateway/gateway.model.service';
import { SensorModelService } from '../../../models/sensor/sensor.model.service';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { DataServerAuthGuard } from '../../../common/guards/data_server_auth.guard';
import { SocketService } from '../../../services/socket-service/socket-service.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/models/user/entity/user.enum';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { OrganizationGatewayResourceGuard } from 'src/common/guards/organization_gateway_resource.guard';
import { OrganizationSensorResourceGuard } from 'src/common/guards/organization_sensor_resource.guard';
import { GatewayType } from 'src/models/gateway/entity/gateway.enum';
import { ServiceAuthGuard } from 'src/common/guards/service_auth.guard';
@Controller('gateway')
@ApiBearerAuth()
@ApiTags('Gateway')
@ApiSecurity('server-auth-key')
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly gatewayModelService: GatewayModelService,
    private readonly sensorModelService: SensorModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly userModelService: UserModelService,
    private readonly socketService: SocketService,
    private logService: LogService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Post('/')
  async addGateway(@Body() createGatewayDto: CreateGatewayDto) {
    const { patientId, ...remainingData } = createGatewayDto;
    // Render err message for duplicate macId or Name
    const existingGatewayWithSameMacId = await this.gatewayModelService.findOneByMacId(
      remainingData.macId,
    );
    if (existingGatewayWithSameMacId) {
      throw new HttpException(
        'Gateway with same macId exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingGatewayWithSameName = await this.gatewayModelService.findOneByName(
      remainingData.name,
    );
    if (existingGatewayWithSameName) {
      throw new HttpException(
        'Gateway with same name exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Assign patientId to device if patientId is present
    if (patientId) {
      await this.userModelService
        .validateOrganizationOfUsers(
          [patientId],
          createGatewayDto.organizationId,
        )
        .catch(() => {
          throw new HttpException(
            'Patient must belongs to the Same Organization',
            HttpStatus.BAD_REQUEST,
          );
        });
      const patientIdInt = (
        await this.patientInfoModelService.findPatientInfoByUserId(patientId)
      ).patientId;
      const gatewayData = {
        patientId: patientIdInt,
        isAvailable: false,
        ...remainingData,
      };
      return await this.gatewayModelService.create(gatewayData).catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    }

    return await this.gatewayModelService.create(remainingData).catch((err) => {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Get('/available-gateways')
  async getAvailableGateways(
    @Query() queryParams: AvailableGatewaysListPaginated,
  ) {
    const { page, perPage, ...filterOptions } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    return await this.gatewayModelService.findAvailableGatewaysPaginated({
      limit,
      skip,
      ...filterOptions,
    });
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    OrganizationGatewayResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Post('/assign-gateway-patient')
  async assignGatewayPatient(
    @Body() assignGatewayPatientDto: AssignGatewayPatientDto,
  ) {
    try {
      const [gateway, patient] = await Promise.all([
        this.gatewayService.validateAndGetGatewayById(
          assignGatewayPatientDto.gatewayId,
        ),
        this.userModelService
          .validateAndGetPatientByUserId(assignGatewayPatientDto.patientId)
          .catch(() => {
            throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
          }),
      ]);
      await this.gatewayService.canGatewayBeAssignedToPatient(patient, gateway);
      const patientInfo = patient.patientInfo;
      await this.gatewayService
        .assignGatewayPatient(gateway, patientInfo.patientId)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      return this.gatewayModelService.findOneDetails(gateway.id);
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Post('/register-patient')
  async registerPatientGateway(
    @Body() registerPatientGateway: RegisterPatientGatewayDto,
  ) {
    try {
      const [patient] = await Promise.all([
        this.userModelService
          .validateAndGetPatientByUserId(registerPatientGateway.patientId)
          .catch(() => {
            throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
          }),
      ]);
      const gateway = await this.gatewayService.validateGatewayForPatientRegistering(
        registerPatientGateway,
        patient.organizationId,
      );
      const patientInfo = patient.patientInfo;
      const assignedGateways = await this.gatewayModelService.findByPatientId(
        patientInfo.patientId,
      );
      if (assignedGateways.length > 0) {
        throw new HttpException(
          `${
            gateway.patientId === patientInfo.patientId ? 'This' : 'A'
          } Gateway is already assigned to the patient`,
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.gatewayService
        .assignGatewayPatient(gateway, patientInfo.patientId)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      return this.gatewayModelService.findOneDetails(gateway.id);
    } catch (error) {
      throw error;
    }
  }

  // @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    // RolesGuard,
    OrganizationGatewayResourceGuard,
    OrganizationPatientResourceGuard,
    PatientResourceGuard,
  )
  @Post('/unassign-gateway-patient')
  async unassignGatewayPatient(
    @Body() assignGatewayPatientDto: AssignGatewayPatientDto,
  ) {
    const [gateway, patientInfo] = await Promise.all([
      this.gatewayService.validateAndGetGatewayById(
        assignGatewayPatientDto.gatewayId,
      ),
      this.userModelService
        .getPatientInfoByUserId(assignGatewayPatientDto.patientId)
        .catch(() => {
          throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
        }),
    ]);
    if (gateway.patientId !== patientInfo.patientId) {
      throw new HttpException(
        'Gateway is not allocated to patient',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (gateway.type === GatewayType.APPLICATION) {
      throw new BadRequestException('You cannot remove an application Gateway');
    }
    await this.gatewayService
      .unassignGatewayPatientOffline(gateway)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    return this.gatewayModelService.findOneDetails(gateway.id);
  }

  @UseGuards(
    JwtAuthGuard,
    OrganizationGatewayResourceGuard,
    OrganizationSensorResourceGuard,
    GatewayGuard,
  )
  @Post('/:id/pair-sensor')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Gateway Id',
  })
  async pairSensor(@Body() pairSensorDto: PairSensorDto, @Param() params) {
    try {
      const {
        gateway,
        sensor,
      } = await this.gatewayService.validateSensorGatewayAssignmentAndGetDetails(
        params.id,
        pairSensorDto.sensorId,
      );
      if (sensor.gatewayId) {
        throw new HttpException(
          sensor.gatewayId === gateway.id
            ? 'The Gateway and Sensor are already paired.'
            : 'Sensor is already paired to other gateway.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!this.gatewayService.getGatewayOnlineStatus(gateway)) {
        throw new HttpException(
          'Gateway is not Online !! Please make sure the Gateway is online before pairing sensor',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.gatewayService.pairSensor(gateway, sensor).catch((err) => {
        throw new HttpException(err.message, HttpStatus.FAILED_DEPENDENCY);
      });
      return await this.gatewayModelService.findOneDetails(gateway.id);
    } catch (error) {
      this.logService.logError('Failed to pair Sensor and Gateway', { error });
      throw error;
    }
  }

  @UseGuards(
    JwtAuthGuard,
    OrganizationGatewayResourceGuard,
    OrganizationSensorResourceGuard,
    GatewayGuard,
  )
  @Post('/:id/unpair-sensor')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Gateway Id',
  })
  async unpairSensor(@Body() unpairSensorDto: PairSensorDto, @Param() params) {
    const [gateway, sensor] = await Promise.all([
      await this.gatewayService.validateAndGetGatewayById(params.id),
      await this.gatewayService.validateAndGetSensorById(
        unpairSensorDto.sensorId,
      ),
    ]);
    if (sensor.gatewayId === gateway.id) {
      if (!this.gatewayService.getGatewayOnlineStatus(gateway)) {
        throw new HttpException(
          'Gateway is not Online !! Please make sure the Gateway is online before unpairing sensor',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.gatewayService.unpairSensor(sensor, gateway).catch((err) => {
        throw new HttpException(err.message, HttpStatus.FAILED_DEPENDENCY);
      });
      return await this.gatewayModelService.findOneDetails(gateway.id);
    } else {
      throw new HttpException(
        'Gateway and sensor are not paired',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationGatewayResourceGuard, GatewayGuard)
  @Post('/:id/clear-sensors')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Gateway Id',
  })
  async clearSensors(@Param() params) {
    const gateway = await this.gatewayService.validateAndGetGatewayById(
      params.id,
    );
    if (!this.gatewayService.getGatewayOnlineStatus(gateway)) {
      throw new HttpException(
        'Gateway is not Online !! Please make sure the Gateway is online before clearing sensor',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.gatewayService.clearSensors(gateway).catch((err) => {
      throw new HttpException(err.message, HttpStatus.FAILED_DEPENDENCY);
    });
  }

  // Paths for MqttService
  @UseGuards(MqttServiceGuard)
  @Post('/mqtt')
  async updateGatewayMqtt(@Body() updateGatewayMqttDto: UpdateGatewayMqttDto) {
    try {
      this.logService.logInfo(
        `Mqtt service gateway data ${JSON.stringify(updateGatewayMqttDto)}`,
      );
      const gateway = await this.gatewayModelService.findOneByMacId(
        updateGatewayMqttDto.macId,
      );
      if (!gateway) {
        throw new HttpException(
          'Invalid Gateway mac id',
          HttpStatus.BAD_REQUEST,
        );
      }
      const gatewayData = {
        id: gateway.id,
        ...updateGatewayMqttDto,
      };
      // update gateway registered time(registering status on FE), when gateway comes online after assigning to patient
      if (
        updateGatewayMqttDto.lastConnectionTime &&
        gateway.patientId &&
        !gateway.isRegistered
      ) {
        gatewayData['isRegistered'] = true;
        gatewayData['registeredTime'] = updateGatewayMqttDto.lastConnectionTime;
      }
      const updatedGateway = await this.gatewayModelService
        .update(gatewayData)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      if (updateGatewayMqttDto.lastConnectionTime) {
        //Automate Gateway and Sensor Pairing
        this.gatewayService
          .automateGatewayAndSensorOnGatewayUpdate(gateway.id)
          .catch((err) => {
            this.logService.logError(
              'Failed to automate Gateway and Sensor pairing on Gateway Update',
              {
                error: err,
                errorMessage: err.message ? err.mesage : '',
                gatewayId: gateway.id,
                method: 'POST: gateway/mqtt',
              },
            );
          });
      }
      this.socketService.emitGatewayUpdateEvent(gateway.id);
      if (gateway.patientId) {
        this.socketService.emitPatientDeviceUpdate(
          'success',
          gateway.patientId,
        );
      }
      return updatedGateway;
    } catch (error) {
      throw error;
    }
  }

  // Paths for data processing server
  @UseGuards(DataServerAuthGuard)
  @Post('/updateGatewayLastConnectionTime')
  async updateGatewayLastConnectionTime(
    @Body() updateGatewayMqttDto: UpdateGatewayMqttDto,
  ) {
    this.logService.logInfo(
      `Data processing service gateway data `,
      updateGatewayMqttDto,
    );
    const { macId, ...updateDto } = updateGatewayMqttDto;
    const gateway = await this.gatewayModelService
      .findOneByMacId(macId)
      .catch(() => {
        throw new HttpException('Invalid mac id', HttpStatus.BAD_REQUEST);
      });
    await this.gatewayModelService
      .updateGatewayById(gateway.id, updateDto)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    //Automate Gateway and Sensor pairing
    this.gatewayService
      .automateGatewayAndSensorOnGatewayUpdate(gateway.id)
      .catch((err) => {
        this.logService.logError(
          'Failed to automate Gateway and Sensor pairing on Gateway Update',
          {
            error: { message: err.message, err },
            gatewayId: gateway.id,
            method: 'POST: gateway/updateGatewayLastConnectionTime',
          },
        );
      });
    // emit event to all online users
    this.socketService.emitGatewayUpdateEvent(gateway.id);
    if (gateway.patientId) {
      this.socketService.emitPatientDeviceUpdate('success', gateway.patientId);
    }
    return { ...gateway, ...updateGatewayMqttDto };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/app-mode/last-connection-time')
  async updateAppGatewayLastConnectionTime(
    @Request() req,
    @Body() dto: UpdateAppGatewayDto,
  ) {
    this.logService.logInfo(`update app gateway data `, dto);
    const gateway = await this.gatewayModelService.findOneByPatientId(
      dto.patientId,
    );
    if (!gateway || gateway.type !== GatewayType.APPLICATION) {
      throw new BadRequestException('No app gateway found for the patient');
    }
    if (
      req.user.role !== Role.PATIENT ||
      req.user.patientInfo.patientId !== dto.patientId
    ) {
      throw new ForbiddenException();
    }
    const gatewayData = {
      id: gateway.id,
      ...dto,
    };
    // update gateway registered time(registering status on FE), when gateway comes online for first time
    if (dto.lastConnectionTime && !gateway.isRegistered) {
      gatewayData['isRegistered'] = true;
      gatewayData['registeredTime'] = dto.lastConnectionTime;
    }
    const updatedGateway = await this.gatewayModelService
      .update(gatewayData)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    // emit event to all online users
    this.socketService.emitGatewayUpdateEvent(gateway.id);
    this.socketService.emitPatientDeviceUpdate('success', gateway.patientId);
    return updatedGateway;
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateGateway(
    @Param() params,
    @Body() updateGatewayDto: UpdateGatewayDto,
  ) {
    const gateway = await this.gatewayService.validateAndGetGatewayById(
      params.id,
    );
    const { patientId, ...remainingData } = updateGatewayDto;
    const updateGatewayData = {
      id: gateway.id,
      ...remainingData,
    };
    if (patientId) {
      await this.userModelService
        .validateOrganizationOfUsers(
          [patientId],
          updateGatewayDto.organizationId
            ? updateGatewayDto.organizationId
            : gateway.organizationId,
        )
        .catch(() => {
          throw new HttpException(
            'Patient must belongs to the Same Organization',
            HttpStatus.BAD_REQUEST,
          );
        });
      const patientIdInt = (
        await this.patientInfoModelService.findPatientInfoByUserId(patientId)
      ).patientId;
      updateGatewayData['patientId'] = patientIdInt;
    } else if (updateGatewayDto.organizationId && gateway.patientId) {
      const patient = await this.patientInfoModelService.findPatientByPatientIdInt(
        gateway.patientId,
      );
      if (patient.organizationId !== updateGatewayDto.organizationId) {
        throw new HttpException(
          'You cannot update the Gateway organization because the Gateway is assigned to a patient',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const updatedGateway = await this.gatewayModelService
      .update(updateGatewayData)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    if (updateGatewayDto.lastConnectionTime) {
      //Automate Gateway and Sensor Pairing
      this.gatewayService
        .automateGatewayAndSensorOnGatewayUpdate(gateway.id)
        .catch((err) => {
          this.logService.logError(
            'Failed to automate Gateway and Sensor pairing on Gateway Update',
            { error: err, gatewayId: gateway.id, method: 'PUT: gateway/:id' },
          );
        });
    }
    this.socketService.emitGatewayUpdateEvent(gateway.id);
    if (updatedGateway.patientId) {
      this.socketService.emitPatientDeviceUpdate(
        'success',
        updatedGateway.patientId,
      );
    }
    return updatedGateway;
  }

  @UseGuards(JwtAuthGuard, OrganizationGatewayResourceGuard, GatewayGuard)
  @Get('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async getGateway(@Param() params) {
    return await this.gatewayService.validateAndGetGatewayById(params.id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteGateway(@Param() params) {
    const gateway = await this.gatewayService.validateAndGetGatewayById(
      params.id,
    );
    if ((gateway.sensors && gateway.sensors.length > 0) || gateway.patientId) {
      throw new HttpException(
        'Clear all paired sensors and unassign from patient before deleting the Gateway',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.gatewayModelService.softDelete(params.id).catch((err) => {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    });
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard, PatientResourceGuard)
  @Get('/')
  async listGatewaysPaginated(@Query() queryParams: GatewaysListPaginated) {
    const { patientId, ...filterOptions } = queryParams;
    const { skip, limit } = getPagination(filterOptions);
    if (patientId) {
      const patientInfo = await this.patientInfoModelService.findPatientInfoByUserId(
        patientId,
      );
      if (!patientInfo) {
        throw new HttpException('Invalid Patient id', HttpStatus.BAD_REQUEST);
      }
      filterOptions['patientIdInt'] = patientInfo.patientId;
    }
    return await this.gatewayModelService
      .findAllGatewaysPaginated({
        skip,
        limit,
        ...filterOptions,
        fields: Array.isArray(filterOptions.field)
          ? filterOptions.field
          : filterOptions.field
          ? [filterOptions.field]
          : [],
        sorts: Array.isArray(filterOptions.sort)
          ? filterOptions.sort
          : filterOptions.sort
          ? [filterOptions.sort]
          : [],
      })
      .catch((err) => {
        this.logService.logError('Error finding gateway list', err);
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }

  @UseGuards(ServiceAuthGuard)
  @ApiHeader({
    name: 'auth-token',
    description: 'Use the secret auth token to authorize the request',
    required: true,
  })
  @Get('/assigned-patient/:macId')
  @ApiParam({ name: 'macId', type: String, required: true })
  async getGatewayPatient(@Param() params) {
    try {
      const gateway = await this.gatewayModelService
        .getGatewayAndAssignedPatientByMacId(params.macId)
        .catch(() => {
          throw new HttpException('Invalid gateway', HttpStatus.BAD_REQUEST);
        });
      if (!(gateway.patientId && gateway.patient && gateway.patient.patient)) {
        throw new BadRequestException(
          'The gateway is not assigned to any patient',
        );
      }
      return gateway.patient;
      // const user = gateway.patient.patient;
      // user['patientInfo'] = gateway.patient;
      // delete user.patientInfo.patient;
      // return user;
    } catch (error) {
      throw error;
    }
  }
}
