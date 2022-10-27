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
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SensorService } from './sensor.service';
import {
  CreateSensorDto,
  UpdateSensorDto,
  SensorsListPaginated,
  AssignSensorPatientDto,
  UpdateSensorMqttDto,
  UpdateSensorLastConnectionTimeDto,
  AvailableSensorsListPaginated,
  UnassignSensorPatientDto,
  RegisterPatientSensorDto,
  CancelUnassigningDeviceDto,
} from './dto';
import { IUpdateSensor } from '../../../models/sensor/interfaces';
import { PatientResourceGuard } from '../../../common/guards/patient_resource.guard';
import { SensorGuard } from '../../../common/guards/sensor.guard';
import { MqttServiceGuard } from '../../../common/guards/mqtt_service.guard';
import { getPagination } from '../../../common/utils/entity_metadata';
import { SensorModelService } from '../../../models/sensor/sensor.model.service';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { DataServerAuthGuard } from 'src/common/guards/data_server_auth.guard';
import { SocketService } from 'src/services/socket-service/socket-service.service';
import { UserModelService } from '../../../models/user/user.model.service';
import {
  DeviceConnectionMode,
  SensorProcessState,
} from 'src/models/sensor/entity/sensor.enum';
import { Role } from 'src/models/user/entity/user.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { OrganizationSensorResourceGuard } from 'src/common/guards/organization_sensor_resource.guard';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('sensor')
@ApiTags('Sensors')
@ApiBearerAuth()
@ApiSecurity('server-auth-key')
export class SensorController {
  constructor(
    private readonly sensorService: SensorService,
    private readonly sensorModelService: SensorModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly socketService: SocketService,
    private readonly userModelService: UserModelService,
    private logService: LogService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Post('/')
  async addSensor(@Body() createSensorDto: CreateSensorDto) {
    const { patientId, ...sensorData } = createSensorDto;
    // Render err message for duplicate macId or Name
    const existingSensorWithSameMacId = await this.sensorModelService.findOneByMacId(
      sensorData.macId,
    );
    if (existingSensorWithSameMacId) {
      throw new HttpException(
        'Sensor with same macId exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSensorWithSameName = await this.sensorModelService.findOneByName(
      sensorData.name,
    );
    if (existingSensorWithSameName) {
      throw new HttpException(
        'Sensor with same name exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Assign patientId to device if patientId is present
    if (patientId) {
      await this.userModelService
        .validateOrganizationOfUsers(
          [patientId],
          createSensorDto.organizationId,
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
      sensorData['patientId'] = patientIdInt;
      sensorData['isAvailable'] = false;
      sensorData['lastProcessedState'] = SensorProcessState.ASSIGN;
    }
    return await this.sensorModelService.create(sensorData).catch((err) => {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Get('/available-sensors')
  async getAvailableSensors(
    @Query() queryParams: AvailableSensorsListPaginated,
  ) {
    const { page, perPage, ...filterOptions } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    return await this.sensorModelService
      .findAvailableSensorsPaginated({
        limit,
        skip,
        ...filterOptions,
      })
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    OrganizationSensorResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Post('/assign-sensor-patient')
  async assignSensorPatient(
    @Body() assignSensorPatientDto: AssignSensorPatientDto,
  ) {
    const [sensor, patient] = await Promise.all([
      this.sensorService.validateAndGetSensorById(
        assignSensorPatientDto.sensorId,
      ),
      this.userModelService
        .validateAndGetPatientByUserId(assignSensorPatientDto.patientId)
        .catch(() => {
          throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
        }),
    ]);
    await this.sensorService.canSensorBeAttachedToPatient(
      patient,
      sensor,
      assignSensorPatientDto.connectionMode,
    );
    if (assignSensorPatientDto.pollingTimeInSeconds) {
      await this.sensorModelService.updateSensorById(sensor.id, {
        pollingTimeInSeconds: assignSensorPatientDto.pollingTimeInSeconds,
      });
      sensor.pollingTimeInSeconds = assignSensorPatientDto.pollingTimeInSeconds;
    }
    await this.sensorService
      .assignSensorPatient(
        sensor,
        patient,
        assignSensorPatientDto.connectionMode,
      )
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    return await this.sensorModelService.findOneDetails(sensor.id);
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Post('/register-patient')
  async registerSensorPatient(
    @Body() registerPatientSensorDto: RegisterPatientSensorDto,
  ) {
    const [patient] = await Promise.all([
      this.userModelService
        .validateAndGetPatientByUserId(registerPatientSensorDto.patientId)
        .catch(() => {
          throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
        }),
    ]);
    const sensor = await this.sensorService.validateSensorForPatientRegistration(
      registerPatientSensorDto,
      patient.organizationId,
    );
    const patientInfo = patient.patientInfo;
    const assignedSensors = await this.sensorModelService.findByPatientId(
      patientInfo.patientId,
    );
    if (assignedSensors.length > 0) {
      throw new HttpException(
        `${
          sensor.patientId === patientInfo.patientId ? 'This' : 'A'
        } Sensor is already assigned to the patient`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (sensor.organizationId != patient.organizationId) {
      throw new HttpException(
        'This sensor cannot be assigned. Please contact support',
        HttpStatus.BAD_REQUEST,
      );
    }
    // if (assignSensorPatientDto.pollingTimeInSeconds) {
    //   await this.sensorModelService.updateSensorById(sensor.id, {
    //     pollingTimeInSeconds: assignSensorPatientDto.pollingTimeInSeconds,
    //   });
    //   sensor.pollingTimeInSeconds = assignSensorPatientDto.pollingTimeInSeconds;
    // }
    await this.sensorService
      .assignSensorPatient(
        sensor,
        patient,
        registerPatientSensorDto.connectionMode,
      )
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    return await this.sensorModelService.findOneDetails(sensor.id);
  }

  // @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    // RolesGuard,
    OrganizationSensorResourceGuard,
    OrganizationPatientResourceGuard,
    PatientResourceGuard,
  )
  @Post('/unassign-sensor-patient')
  async unassignSensorPatient(
    @Body() unassignSensorPatientDto: UnassignSensorPatientDto,
  ) {
    try {
      const [sensor, patientInfo] = await Promise.all([
        this.sensorService.validateAndGetSensorById(
          unassignSensorPatientDto.sensorId,
        ),
        this.userModelService
          .getPatientInfoByUserId(unassignSensorPatientDto.patientId)
          .catch(() => {
            throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
          }),
      ]);
      if (sensor.patientId !== patientInfo.patientId) {
        throw new HttpException(
          'Sensor is not allocated to patient',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.sensorService.unassignSensorPatientOffline(sensor);
      return await this.sensorModelService.findOneDetails(sensor.id);
    } catch (error) {
      throw error;
    }
  }

  // @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    // RolesGuard,
    OrganizationSensorResourceGuard,
    OrganizationPatientResourceGuard,
    PatientResourceGuard,
  )
  @Post('/unassign/cancel')
  async cancelUnassignDevice(
    @Body() cancelUnassigningDto: CancelUnassigningDeviceDto,
  ) {
    try {
      const patientInfo = await this.patientInfoModelService.getPatientDevicesByUserId(
        cancelUnassigningDto.patientId,
      );
      if (!patientInfo) {
        throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
      }
      if (
        !patientInfo.sensors ||
        !patientInfo.gateways ||
        !(patientInfo.sensors.length > 0) ||
        !(patientInfo.gateways.length > 0)
      ) {
        throw new BadRequestException(
          'Invalid request for cancelling unassignment',
        );
      }
      const [sensor, gateway] = [
        patientInfo.sensors[0],
        patientInfo.gateways[0],
      ];
      if (!sensor.gatewayId) {
        throw new BadRequestException(
          'Cannot process the cancel unassignment request',
        );
      }
      await this.sensorService.cancelUnassignDevices(sensor, gateway);
      return this.patientInfoModelService.getPatientDevicesByUserId(
        cancelUnassigningDto.patientId,
      );
    } catch (error) {
      throw error;
    }
  }

  // Path for MqttService
  @UseGuards(MqttServiceGuard)
  @Post('/mqtt')
  async updateSensorMqtt(@Body() updateSensorMqttDto: UpdateSensorMqttDto) {
    try {
      this.logService.logInfo(
        `Mqtt service sensor data ${JSON.stringify(updateSensorMqttDto)}`,
      );
      const sensor = await this.sensorModelService.findOneByMacId(
        updateSensorMqttDto.macId,
      );
      if (!sensor) {
        throw new HttpException(
          'Invalid Sensor mac id',
          HttpStatus.BAD_REQUEST,
        );
      }

      let sensorData: IUpdateSensor = {
        id: sensor.id,
      };

      // Check isRegistered field in sensor table.
      // CASE 1. If that field is false and isRegistered in the updateSensorMqttDto
      // is true(pairing just happened), update the field in the sensor table.
      if (!sensor.isRegistered && updateSensorMqttDto.isRegistered) {
        sensorData = {
          ...sensorData,
          registeredTime: updateSensorMqttDto.registeredTime,
          isRegistered: true,
          ...(updateSensorMqttDto.lastConnectionTime && {
            lastConnectionTime: updateSensorMqttDto.lastConnectionTime,
          }),
        };
      }
      // CASE 2. If isRegistered in the updateSensorMqttDto is false,
      // set the corresponding sensor field to null.
      // CASE 3. If both the field and is_registered is true,
      // don't update the registered_time.
      else if (!updateSensorMqttDto.isRegistered) {
        sensorData = {
          ...sensorData,
          registeredTime: null,
          isRegistered: false,
        };
      } else {
        sensorData = {
          ...sensorData,
          ...(updateSensorMqttDto.lastConnectionTime && {
            lastConnectionTime: updateSensorMqttDto.lastConnectionTime,
          }),
        };
      }

      const updatedSensor = await this.sensorModelService
        .update(sensorData)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      if (updateSensorMqttDto.lastConnectionTime) {
        this.socketService.emitSensorUpdateEvent(sensor.id);
      }
      if (sensor.patientId) {
        this.socketService.emitPatientDeviceUpdate('success', sensor.patientId);
      }
      return updatedSensor;
    } catch (error) {
      throw error;
    }
  }

  // Path for data processing server
  @UseGuards(DataServerAuthGuard)
  @Post('/updateSensorLastConnectionTime')
  async updateSensorLastConnectionTime(
    @Body()
    updateSensorLastConnectionTimeDto: UpdateSensorLastConnectionTimeDto,
  ) {
    this.logService.logInfo(
      `Data processing service sensor data `,
      updateSensorLastConnectionTimeDto,
    );
    const { macId, ...updateDto } = updateSensorLastConnectionTimeDto;
    const sensor = await this.sensorModelService
      .findOneByMacId(macId)
      .catch(() => {
        throw new HttpException('Invalid mac id', HttpStatus.BAD_REQUEST);
      });
    if (sensor) {
      const sensorData = {
        ...updateDto,
      };
      if (
        sensor.connectionMode &&
        sensor.connectionMode === DeviceConnectionMode.APPLICATION_MODE &&
        !sensor.isRegistered
      ) {
        /*If sensor is attached in app mode AND 
          If the sensor pings for the first time (Not registered yet) 
          => update sensor register status and register time */
        sensorData['isRegistered'] = true;
        sensorData['registeredTime'] =
          updateSensorLastConnectionTimeDto.lastConnectionTime;
      }
      await this.sensorModelService.updateSensorById(sensor.id, sensorData);
      this.socketService.emitSensorUpdateEvent(sensor.id);
      if (sensor.patientId) {
        this.socketService.emitPatientDeviceUpdate('success', sensor.patientId);
      }
      return { ...sensor, ...sensorData };
    } else {
      throw new HttpException('Invalid Sensor', HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateSensor(
    @Param() params,
    @Body() updateSensorDto: UpdateSensorDto,
  ) {
    try {
      const sensor = await this.sensorService.validateAndGetSensorById(
        params.id,
      );
      const { patientId, ...remainingData } = updateSensorDto;
      const updateSensorData = {
        id: sensor.id,
        ...remainingData,
      };
      if (patientId) {
        await this.userModelService
          .validateOrganizationOfUsers(
            [patientId],
            updateSensorDto.organizationId
              ? updateSensorDto.organizationId
              : sensor.organizationId,
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
        updateSensorData['patientId'] = patientIdInt;
        updateSensorData['isAvailable'] = false;
      } else if (updateSensorDto.organizationId && sensor.patientId) {
        const patient = await this.patientInfoModelService.findPatientByPatientIdInt(
          sensor.patientId,
        );
        if (patient.organizationId !== updateSensorDto.organizationId) {
          throw new HttpException(
            'You cannot update the Sensor organization because the Sensor is assigned to a patient',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const updatedSensor = await this.sensorModelService.update(
        updateSensorData,
      );
      // emit updated status event
      if (updateSensorDto.lastConnectionTime) {
        this.socketService.emitSensorUpdateEvent(sensor.id);
      }
      if (updatedSensor.patientId) {
        this.socketService.emitPatientDeviceUpdate('success', sensor.patientId);
      }
      return updatedSensor;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationSensorResourceGuard, SensorGuard)
  @Get('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async getSensor(@Param() params) {
    try {
      return await this.sensorService.validateAndGetSensorById(params.id);
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteSensor(@Param() params) {
    try {
      const sensor = await this.sensorService.validateAndGetSensorById(
        params.id,
      );
      if (sensor.patientId) {
        throw new HttpException(
          'Cannot delete an assigned sensor',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.sensorModelService
        .softDelete(params.id)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard, PatientResourceGuard)
  @Get('/')
  async listSensorsPaginated(@Query() queryParams: SensorsListPaginated) {
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
    return await this.sensorModelService
      .findAllSensorsPaginated({
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
        this.logService.logError('Error finding sensor list', err);
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }
}
