import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Sensor } from '../../../models/sensor/entity/sensor.entity';
import { SensorModelService } from '../../../models/sensor/sensor.model.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { LogService } from '../../../services/logger/logger.service';
import { GatewayModelService } from '../../../models/gateway/gateway.model.service';
import { GatewayService } from '../gateway/gateway.service';
import { SocketService } from '../../../services/socket-service/socket-service.service';
import {
  DeviceConnectionMode,
  SensorProcessState,
  SensorProcessStateStatus,
  SensorState,
  SensorStateStatus,
} from 'src/models/sensor/entity/sensor.enum';
import { RegisterPatientSensorDto } from './dto';
import { User } from 'src/models/user/entity/user.entity';
import { GatewayType } from 'src/models/gateway/entity/gateway.enum';
import { Gateway } from 'src/models/gateway/entity/gateway.entity';

@Injectable()
export class SensorService {
  constructor(
    private sensorModelService: SensorModelService,
    private gatewayModelService: GatewayModelService,
    private userModelService: UserModelService,
    @Inject(forwardRef(() => GatewayService))
    private gatewayService: GatewayService,
    private socketService: SocketService,
    private logService: LogService,
  ) {}

  async assignSensorPatient(
    sensor: Sensor,
    patient: User,
    connectionMode?: DeviceConnectionMode,
  ) {
    const patientIdInt = patient.patientInfo.patientId;
    const updateSensor = await this.sensorModelService.updateSensorById(
      sensor.id,
      {
        isAvailable: false,
        patientId: patientIdInt,
        connectionMode: connectionMode
          ? connectionMode
          : DeviceConnectionMode.GATEWAY_MODE,
        isActive: true,
        lastConnectionTime: null,
        lastProcessedState: SensorProcessState.ASSIGN,
        processedStateStatus: SensorProcessStateStatus.SUCCESS,
        sensorState: SensorState.ASSIGN,
        sensorStateStatus: SensorStateStatus.PENDING,
      },
    );
    if (connectionMode === DeviceConnectionMode.APPLICATION_MODE) {
      // Creating a dummy Gateway and assigning it to the patient
      await this.attachGatewayForPatientOnAppMode(patient);
    }
    this.socketService.emitPatientDeviceUpdate('success', patientIdInt);
    //send update of sensor
    this.socketService.emitSensorUpdateEvent(sensor.id);
    this.automateGatewayAndSensorPairingOnSensorUpdate(sensor.id).catch(
      (err) => {
        this.logService.logError(
          'Failed to automate Gateway and Sensor pairing on SensorUpdate',
          {
            error: { message: err.message, err },
            sensor,
            Method: 'assignSensorPatient Function on sensor.service',
          },
        );
      },
    );
    return updateSensor;
  }

  async unassignSensorPatientOffline(sensor: Sensor) {
    try {
      switch (sensor.connectionMode) {
        case DeviceConnectionMode.GATEWAY_MODE:
          await await this.unassignSensorPatientOfflineGatewayMode(sensor);
          break;
        case DeviceConnectionMode.APPLICATION_MODE:
          await await this.unassignSensorPatientOfflineAppMode(sensor);
          break;
        default:
          throw new Error('Sensor is not connected to device');
      }
    } catch (error) {
      this.logService.logError(
        'Failed at unassigning sensor patient offline',
        error,
      );
      throw error;
    }
  }

  async cancelUnassignDevices(sensor: Sensor, gateway: Gateway) {
    try {
      if (
        sensor.sensorState === SensorState.UNASSIGN &&
        sensor.sensorStateStatus !== SensorStateStatus.SUCCESS
      ) {
        if (
          sensor.lastProcessedState === SensorProcessState.UNPAIR &&
          sensor.processedStateStatus === SensorProcessStateStatus.PROCESSING
        ) {
          // message already send to Gateway and waiting for unpairing success
          throw new HttpException(
            'Request cannot be processed !',
            HttpStatus.CONFLICT,
          );
        }
        //Cancel sensor offline unassignment and revert sensor to its previous stage
        const updatePromises = [
          this.sensorModelService.updateSensorById(sensor.id, {
            sensorState: SensorState.ASSIGN,
            sensorStateStatus: SensorStateStatus.SUCCESS,
            unassignRequest: false,
          }),
        ];
        if (gateway.unassignRequest) {
          updatePromises.push(
            this.gatewayModelService.updateGatewayById(gateway.id, {
              unassignRequest: false,
            }),
          );
        }
        await Promise.all(updatePromises);
        this.socketService.emitPatientDeviceUpdate('success', sensor.patientId);
      } else {
        throw new BadRequestException(
          'Cancelling unassignment cannot be processed',
        );
      }
    } catch (error) {
      this.logService.logError('Failed at cancel unassigning devices', error);
      throw error;
    }
  }

  async unassignSensorPatientOfflineGatewayMode(sensor: Sensor) {
    try {
      if (sensor.gatewayId) {
        // sensor is paired
        // ie; sensor can be in 'assign-success' OR 'unassign-pending' OR 'unassign-failed'
        if (sensor.sensorState === SensorState.UNASSIGN) {
          //already unassigned
          if (sensor.sensorStateStatus === SensorStateStatus.PENDING) {
            //already unassigned pending
            throw new HttpException(
              'Unassigning the Sensor is in Process. Please make sure the Gateway is Online to complete the process',
              HttpStatus.FAILED_DEPENDENCY,
            );
          }
          if (sensor.sensorStateStatus === SensorStateStatus.FAILED) {
            //unassigned failed case
            throw new HttpException(
              'Unpairing process failed. Please contact Admin',
              HttpStatus.FAILED_DEPENDENCY,
            );
          }
        }
        // Make sensor for Offline unpairing
        await this.sensorModelService.updateSensorById(sensor.id, {
          sensorState: SensorState.UNASSIGN,
          sensorStateStatus: SensorStateStatus.PENDING,
          unassignRequest: true,
        });
        this.socketService.emitPatientDeviceUpdate('success', sensor.patientId);
        // try offline unassignment
        this.gatewayService
          .automateGatewayAndSensorUnassigning(sensor.id)
          .catch((err) => {
            this.logService.logError(
              'Failed to automateGatewayAndSensorUnassigning on unassignSensorPatientOffline',
              {
                error: err,
                sensor,
                method:
                  'unassignSensorPatientOffline function in sensor.service',
              },
            );
          });
      } else if (
        sensor.processedStateStatus === SensorProcessStateStatus.PROCESSING
      ) {
        // sensor not paired and is on processing pair-sensor request
        // (sensor already send message to gateway and waitng for the response)
        throw new HttpException(
          'Sorry the Sensor is busy. Please try again',
          HttpStatus.CONFLICT,
        );
      } else {
        // Also at this point of execution, sensor can be in 'assign-failed' state too
        // so allowing the sensor to remove from patient
        this.unassignSensor(sensor);
      }
    } catch (error) {
      this.logService.logError(
        'Failed at unassigning sensor patient offline Gateway Mode',
        error,
      );
      throw error;
    }
  }

  async unassignSensorPatientOfflineAppMode(sensor: Sensor) {
    try {
      await this.gatewayModelService.deleteByPatientId(sensor.patientId);
      await this.unassignSensor(sensor);
    } catch (error) {
      this.logService.logError(
        'Failed at unassigning sensor patient offline Application Mode',
        error,
      );
      throw error;
    }
  }

  async unassignSensor(sensor: Sensor, socketEmit = true) {
    try {
      const patientId = sensor.patientId;
      await this.sensorModelService.updateSensorById(sensor.id, {
        isAvailable: true,
        patientId: null,
        isActive: false,
        isPaired: false,
        unassignRequest: false,
        isRegistered: false,
        registeredTime: null,
        // lastConnectionTime: null,
        lastProcessedState: SensorProcessState.AVAILABLE,
        processedStateStatus: SensorProcessStateStatus.SUCCESS,
        sensorState: SensorState.UNASSIGN,
        sensorStateStatus: SensorStateStatus.SUCCESS,
        connectionMode: null,
      });
      if (socketEmit && patientId) {
        this.socketService.emitPatientDeviceUpdate('success', patientId);
      }
      //send update of sensor
      this.socketService.emitSensorUpdateEvent(sensor.id);
    } catch (error) {
      this.logService.logError('Failed at unassignSensor ', error);
      throw error;
    }
  }

  async attachGatewayForPatientOnAppMode(patient: User) {
    try {
      await this.gatewayModelService.create(
        {
          name: `${patient.username}-app`,
          macId: '--',
          organizationId: patient.organizationId,
          isAvailable: false,
          patientId: patient.patientInfo.patientId,
        },
        GatewayType.APPLICATION,
      );
    } catch (error) {
      throw error;
    }
  }

  // async unassignSensorPatient(sensor: Sensor) {
  //   try {
  //     let emitUnpair = false;
  //     if (sensor.gatewayId) {
  //       // Unpair sensor from assigned Gateway of patient
  //       const gateway = sensor.gateway
  //         ? sensor.gateway
  //         : await this.gatewayModelService.findOne(sensor.gatewayId);
  //       if (!this.gatewayService.getGatewayOnlineStatus(gateway)) {
  //         throw new HttpException(
  //           'Since the sensor is paired with a gateway, the gateway must be online before unassigning !!',
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }
  //       await this.gatewayService
  //         .unpairSensor(sensor, gateway, false)
  //         .catch(async () => {
  //           this.socketService.emitSensorEvent(
  //             CLIENT_SOCKET_EVENTS.UNPAIR_SENSOR,
  //             'failure',
  //             sensor.id,
  //           );
  //           throw new HttpException(
  //             'Failed to unpair the sensor from gateway. Since the sensor is paired with the assigned Gateway. Please make sure the Gateway is online !',
  //             HttpStatus.FAILED_DEPENDENCY,
  //           );
  //         });
  //       emitUnpair = true;
  //     }
  //     await this.sensorModelService.updateSensorById(sensor.id, {
  //       isAvailable: true,
  //       patientId: null,
  //       isActive: false,
  //       isPaired: false,
  //       lastProcessedState: SensorProcessState.AVAILABLE,
  //       processedStateStatus: SensorProcessStateStatus.SUCCESS,
  //       sensorState: SensorState.AVAILABLE,
  //       sensorStateStatus: SensorStateStatus.SUCCESS,
  //     });
  //     if (emitUnpair) {
  //       this.socketService.emitSensorEvent(
  //         CLIENT_SOCKET_EVENTS.UNPAIR_SENSOR,
  //         'success',
  //         sensor.id,
  //       );
  //     }
  //   } catch (error) {
  //     this.logService.logError('Failed at unassigning sensor patient', error);
  //     throw error;
  //   }
  // }

  async validateAndGetSensorById(sensorId: string): Promise<Sensor> {
    try {
      const sensor = await this.sensorModelService.findOneDetails(sensorId);
      if (!sensor) {
        throw new HttpException('Invalid Sensor', HttpStatus.BAD_REQUEST);
      }
      return sensor;
    } catch (err) {
      throw err;
    }
  }

  async canSensorBeAttachedToPatient(
    patient: User,
    sensor: Sensor,
    connectionMode?: DeviceConnectionMode | DeviceConnectionMode.GATEWAY_MODE,
  ): Promise<void> {
    try {
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
      } else if (sensor.patientId) {
        throw new HttpException(
          'Sensor is currently allocated',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (sensor.organizationId != patient.organizationId) {
        throw new HttpException(
          'Sensor can only be assigned to patients in the organization',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (connectionMode === DeviceConnectionMode.APPLICATION_MODE) {
        const gatewayAttached = await this.gatewayModelService.findByPatientId(
          patientInfo.patientId,
        );
        if (gatewayAttached && gatewayAttached.length > 0) {
          throw new HttpException(
            'A Gateway is already assigned to the patient. Please unassign it before connecting in applicaton mode ',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async validateSensorForPatientRegistration(
    sensorRegisterDto: RegisterPatientSensorDto,
    organizationId: string,
  ): Promise<Sensor> {
    try {
      const sensor = await this.sensorModelService.findOneByName(
        sensorRegisterDto.name,
        { organizationId },
      );
      if (!sensor) {
        throw new HttpException(
          'No such sensor is registered on the organization',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (sensor.patientId) {
        if (sensor.patient.userId === sensorRegisterDto.patientId) {
          throw new HttpException(
            'Sensor is already registerd',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          throw new HttpException(
            'This sensor cannot be registerd to the patient',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (!sensor.isAvailable) {
        throw new BadRequestException('Sensor is not available to connect');
      }
      return sensor;
    } catch (err) {
      throw err;
    }
  }
  async automateGatewayAndSensorPairingOnSensorUpdate(
    sensorId: string,
  ): Promise<Sensor> {
    try {
      const sensor = await this.sensorModelService.findOneDetails(sensorId);
      if (sensor.connectionMode === DeviceConnectionMode.GATEWAY_MODE) {
        this.logService.logInfo(`Automate pairing on sensor update`, sensor);
        // TODO:Check sensorStateStatus is failed or not
        if (sensor.gatewayId && sensor.gateway) {
          this.logService.logInfo(
            `Assigned sensor is already paired to the Gateway on automate sensor update`,
            { sensor, gateway: sensor.gateway },
          );
          // throw new Error('Sensor is already paired to Gateway');
          return sensor;
        }
        if (
          sensor.lastProcessedState === SensorProcessState.PAIR &&
          sensor.processedStateStatus === SensorProcessStateStatus.PROCESSING
        ) {
          this.logService.logInfo(
            `Sensor Pairing in process found on automate sensor update`,
            { sensor },
          );
          // throw new Error('Sensor is already paired to Gateway');
          return sensor;
        }
        if (sensor.patientId && sensor.patient) {
          const assignedGateway = await this.gatewayModelService.findByPatientId(
            sensor.patientId,
          );
          //patient can have only one Gateway.
          if (assignedGateway && assignedGateway.length > 0) {
            this.logService.logInfo(
              `Assigned gateway for the patient on automate sensor update: ${JSON.stringify(
                assignedGateway,
              )}`,
            );
            // Automate pairing of Assigned Sensor with the Gateway
            if (
              !this.gatewayService.getGatewayOnlineStatus(assignedGateway[0])
            ) {
              throw new Error('Assigned Gateway is not Online for Pairing');
            }
            await this.gatewayService
              .pairSensor(assignedGateway[0], sensor)
              .catch((err) => {
                throw err;
              });
            return await this.sensorModelService.findOneDetails(sensor.id);
            // }
          } else {
            throw new Error('No Gateway is assigned to the patient');
          }
        } else {
          throw new Error('Sensor is not paired to any patient');
        }
      } else {
        // throw new Error('Sensor is not on GATEWAY_MODE for Offline pairing');
        return sensor;
      }
    } catch (err) {
      throw err;
    }
  }
}
