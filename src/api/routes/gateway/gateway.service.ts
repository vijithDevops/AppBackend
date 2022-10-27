import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Gateway } from '../../../models/gateway/entity/gateway.entity';
import { Sensor } from '../../../models/sensor/entity/sensor.entity';
import { GatewayModelService } from '../../../models/gateway/gateway.model.service';
import { SensorModelService } from '../../../models/sensor/sensor.model.service';
import { LogService } from '../../../services/logger/logger.service';
import { GATEWAY_ONLINE_BEFORE } from 'src/config/constants';
import { SocketService } from '../../../services/socket-service/socket-service.service';
import { MQTTService } from '../../../services/mqtt-service/mqtt-service.service';
import {
  SensorProcessState,
  SensorProcessStateStatus,
  SensorState,
  SensorStateStatus,
} from 'src/models/sensor/entity/sensor.enum';
import { SensorService } from '../sensor/sensor.service';
import { RegisterPatientGatewayDto } from './dto';
import { User } from 'src/models/user/entity/user.entity';
import { GatewayType } from 'src/models/gateway/entity/gateway.enum';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayModelService: GatewayModelService,
    private readonly sensorModelService: SensorModelService,
    private readonly socketService: SocketService,
    @Inject(forwardRef(() => SensorService))
    private readonly sensorService: SensorService,
    private readonly mqttService: MQTTService,
    private logService: LogService,
  ) {}

  async assignGatewayPatient(gateway: Gateway, patientIdInt: number) {
    const updateGateway = await this.gatewayModelService.updateGatewayById(
      gateway.id,
      {
        isAvailable: false,
        patientId: patientIdInt,
        isActive: true,
      },
    );
    // sens update of patient details
    this.socketService.emitPatientDeviceUpdate('success', patientIdInt);
    //send update of gateway
    this.socketService.emitGatewayUpdateEvent(gateway.id);
    this.automateGatewayAndSensorOnGatewayUpdate(gateway.id).catch((err) => {
      this.logService.logError(
        'Failed to automate Gateway and Sensor pairing on Gateway Update',
        {
          error: err,
          gatewayId: gateway.id,
          method: 'assignGatewayPatient function in gateway.service',
        },
      );
    });
    return updateGateway;
  }

  async unassignGatewayPatientOffline(gateway: Gateway) {
    try {
      if (gateway.sensors && gateway.sensors.length > 0) {
        // A sensor is paired to the gateway
        // So the connected sensor will be in the status assign-success OR unassign-pending OR unassign-failed
        const pairedSensor = gateway.sensors[0];
        if (pairedSensor.sensorState === SensorState.UNASSIGN) {
          //sensor already in unassign state
          if (pairedSensor.sensorStateStatus === SensorStateStatus.PENDING) {
            // already in unassign-pending state
            throw new HttpException(
              'Unpairing the Gateway is in Process. Please turn on the Gateway to complete the process',
              HttpStatus.FAILED_DEPENDENCY,
            );
          }
          if (pairedSensor.sensorStateStatus === SensorStateStatus.FAILED) {
            //sensor in unassign-failed state
            // This happens when the MQTT server already try to send unpair request to Gateway and the Server responds with 504
            throw new HttpException(
              'Unpairing process failed. Please contact Admin',
              HttpStatus.FAILED_DEPENDENCY,
            );
          }
        }
        // Make sensor for Offline unpairing & update gateway unassign request
        await Promise.all([
          this.sensorModelService.updateSensorById(pairedSensor.id, {
            sensorState: SensorState.UNASSIGN,
            sensorStateStatus: SensorStateStatus.PENDING,
            unassignRequest: true,
          }),
          this.gatewayModelService.updateGatewayById(gateway.id, {
            unassignRequest: true,
          }),
        ]);
        // Update gateway unassigning
        this.socketService.emitPatientDeviceUpdate(
          'success',
          gateway.patientId,
        );
        // try automating unassignment
        this.automateGatewayAndSensorUnassigning(pairedSensor.id).catch(
          (err) => {
            this.logService.logError(
              'Failed to automateGatewayAndSensorUnassigning on unassignGatewayPatientOffline',
              {
                error: err,
                gateway,
                method:
                  'unassignGatewayPatientOffline function in gateway.service',
              },
            );
          },
        );
      } else if (gateway.patientId) {
        const patientSensors = await this.sensorModelService.findByPatientId(
          gateway.patientId,
        );
        if (patientSensors && patientSensors.length > 0) {
          // The patient has an assigned Sensor too
          // So the sensor will be in the status 'assign-pending' OR 'assign-failed'
          // (In both case we can remove assigned sensor and Gateway from patient because the gateway doesnt receive any pairing request)
          const assignedSensor = patientSensors[0];
          if (
            (assignedSensor.lastProcessedState === SensorProcessState.PAIR &&
              assignedSensor.processedStateStatus ===
                SensorProcessStateStatus.PROCESSING) ||
            assignedSensor.gatewayId
          ) {
            // assigned sensor already send message to gateway and waitng for the response
            // In the mean time Sensor got connected to Gateway ie; Paired(assign-success) (worst case)
            throw new HttpException(
              'Sorry the Gateway is busy. Please try again',
              HttpStatus.CONFLICT,
            );
          }
          //unassign sensor from the patient;
          await this.sensorService.unassignSensor(assignedSensor, false);
        }
        this.unassignGateway(gateway);
      }
    } catch (error) {
      this.logService.logError('Failed to unassign Gateway offline', { error });
      throw error;
    }
  }

  async unassignGateway(gateway: Gateway, socketEmit = true) {
    try {
      const patientId = gateway.patientId;
      await this.gatewayModelService.updateGatewayById(gateway.id, {
        isAvailable: true,
        patientId: null,
        isActive: false,
        isRegistered: false,
        registeredTime: null,
        // lastConnectionTime: null,
        unassignRequest: false,
      });
      // gateway.sensors = [];
      if (socketEmit && patientId) {
        this.socketService.emitPatientDeviceUpdate('success', patientId);
      }
      //send update of gateway
      this.socketService.emitGatewayUpdateEvent(gateway.id);
    } catch (error) {
      this.logService.logError('Failed to unassignGateway', { error });
      throw error;
    }
  }

  // async unassignGatewayPatient(gateway: Gateway) {
  //   try {
  //     let emitSocket = false;
  //     if (gateway.sensors && gateway.sensors.length > 0) {
  //       // A sensor is paired to the gateway; so clear the sensor before unassigning
  //       if (!this.getGatewayOnlineStatus(gateway)) {
  //         throw new HttpException(
  //           'Since a sensor is paired with the gateway, the gateway must be online before unassigning !!',
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }
  //       await this.clearSensors(gateway, false).catch(() => {
  //         this.socketService.emitGatewayEvent(
  //           CLIENT_SOCKET_EVENTS.CLEAR_SENSOR,
  //           'failure',
  //           gateway.id,
  //         );
  //         throw new HttpException(
  //           'Failed to clear the sensor paired with the Gateway. Make sure the Gateway is online !',
  //           HttpStatus.FAILED_DEPENDENCY,
  //         );
  //       });
  //       emitSocket = true;
  //     }
  //     // gateway.sensors = [];
  //     await this.gatewayModelService.updateGatewayById(gateway.id, {
  //       isAvailable: true,
  //       patientId: null,
  //       isActive: false,
  //     });
  //     // Emit event to Socket once the mapping is cleared
  //     if (emitSocket) {
  //       this.socketService.emitGatewayEvent(
  //         CLIENT_SOCKET_EVENTS.UNASSIGN_DEVICE,
  //         'success',
  //         gateway.id,
  //       );
  //     }
  //   } catch (error) {
  //     this.logService.logError('Failed to unassign Gateway', { error });
  //     throw error;
  //   }
  // }

  async pairSensor(gateway: Gateway, sensor: Sensor, socketEmit = true) {
    try {
      // Send message to MQTT service to initiate pairing
      const pairSensorData = {
        userId: gateway.patientId || null,
        gatewayMac: gateway.macId,
        sensorMac: sensor.macId,
        sensorName: sensor.name,
        deviceType: sensor.sensorType,
        pollingTime: sensor.pollingTimeInSeconds,
      };
      const patientId = gateway.patientId;
      this.logService.logInfo(`Sending Pair sensor request to MQTT: `, {
        sensor,
        gateway,
      });
      // make sensor on waiting state
      await this.sensorModelService.updateSensorById(sensor.id, {
        lastProcessedState: SensorProcessState.PAIR,
        processedStateStatus: SensorProcessStateStatus.PROCESSING,
      });
      const response = await this.mqttService
        .pairSensor(pairSensorData)
        .catch(async (err) => {
          this.logService.logError(`Pair sensor Error Handler `, {
            sensor,
            gateway,
            error: err,
          });
          // MQTT server responds Failed
          if (
            err.response &&
            err.response.status &&
            err.response.status !== 504
          ) {
            await this.sensorModelService.updateSensorById(sensor.id, {
              sensorState: SensorState.ASSIGN,
              sensorStateStatus: SensorStateStatus.FAILED,
            });
            if (socketEmit && patientId) {
              this.socketService.emitPatientDeviceUpdate('failed', patientId);
            }
          }
          throw err;
        });
      this.logService.logInfo(`Pair sensor Success Handler `, {
        pairSensorData,
        response: response.data,
      });
      // update sensor mapping and sensor processed state
      const updateSensor = await this.sensorModelService.updateSensorById(
        sensor.id,
        {
          gatewayId: gateway.id,
          lastProcessedState: SensorProcessState.PAIR,
          processedStateStatus: SensorProcessStateStatus.SUCCESS,
          sensorState: SensorState.ASSIGN,
          sensorStateStatus: SensorStateStatus.SUCCESS,
          isPaired: true,
          patientDeviceRegistration: true,
        },
      );
      this.logService.logInfo('Gateway and Sensor are Successfully paired', {
        gatewayId: gateway.id,
        sensorId: sensor.id,
        pairSensorData,
      });
      // emit updated patietn details
      if (socketEmit && patientId) {
        this.socketService.emitPatientDeviceUpdate('success', patientId);
      }
      // emit updated sensor details
      if (socketEmit) {
        this.socketService.emitSensorUpdateEvent(sensor.id);
      }
      return updateSensor;
    } catch (err) {
      await this.sensorModelService.updateSensorById(sensor.id, {
        lastProcessedState: SensorProcessState.PAIR,
        processedStateStatus: SensorProcessStateStatus.FAILED,
      });
      this.logService.logError('Failed to pair sensor', {
        message: err.message,
        err,
      });
      throw err;
    }
  }

  async unpairSensor(sensor: Sensor, gateway: Gateway, socketEmit = true) {
    try {
      const unpairSensorData = {
        userId: gateway.patientId || null,
        gatewayMac: gateway.macId,
        sensorMac: sensor.macId,
        sensorName: sensor.name,
        deviceType: sensor.sensorType,
      };
      const patientId = sensor.patientId;
      // make sensor on waiting state
      await this.sensorModelService.updateSensorById(sensor.id, {
        lastProcessedState: SensorProcessState.UNPAIR,
        processedStateStatus: SensorProcessStateStatus.PROCESSING,
      });
      // send unpair message to MQTT server
      const response = await this.mqttService
        .unpairSensor(unpairSensorData)
        .catch(async (err) => {
          this.logService.logError(`Unpair sensor Error Handler `, {
            sensor,
            gateway,
            error: err,
          });
          // MQTT server responds Failed
          if (
            err.response &&
            err.response.status &&
            err.response.status !== 504
          ) {
            await this.sensorModelService.updateSensorById(sensor.id, {
              sensorState: SensorState.UNASSIGN,
              sensorStateStatus: SensorStateStatus.FAILED,
            });
            this.socketService.emitPatientDeviceUpdate('failed', patientId);
          }
          throw err;
        });
      this.logService.logInfo(`unpair sensor Success Handler `, {
        unpairSensorData,
        response: response.data,
      });
      // update sensor mapping and update processing state
      await this.sensorModelService.updateSensorById(sensor.id, {
        gatewayId: null,
        lastProcessedState: SensorProcessState.UNPAIR,
        processedStateStatus: SensorProcessStateStatus.SUCCESS,
        isPaired: false,
        patientDeviceRegistration: false,
      });
      // emit updated patient details
      if (socketEmit && patientId) {
        this.socketService.emitPatientDeviceUpdate('success', patientId);
      }
      if (socketEmit) {
        this.socketService.emitSensorUpdateEvent(sensor.id);
      }
    } catch (err) {
      await this.sensorModelService.updateSensorById(sensor.id, {
        lastProcessedState: SensorProcessState.UNPAIR,
        processedStateStatus: SensorProcessStateStatus.FAILED,
      });
      this.logService.logError('Failed to unpair sensor', { err });
      // if (socketEmit) {
      //   this.socketService.emitSensorUpdateEvent(sensor.id);
      // }
      throw new Error(
        'Failed to unpair sensor from Gateway. Make sure the Gateway is online !',
      );
    }
  }

  async clearSensors(gateway: Gateway, socketEmit = true) {
    try {
      const clearSensorsData = {
        userId: gateway.patientId || null,
        gatewayMac: gateway.macId,
      };
      const patientId = gateway.patientId;
      const response = await this.mqttService.clearSensors(clearSensorsData);
      this.logService.logInfo(`clear sensor Success Handler `, {
        clearSensorsData,
        response: response.data,
      });
      await this.sensorModelService.updateSensorsOnGatewayClearSensorSuccess(
        gateway.id,
      );
      if (socketEmit && patientId) {
        this.socketService.emitPatientDeviceUpdate('success', patientId);
      }
      if (socketEmit) {
        this.socketService.emitGatewayUpdateEvent(gateway.id);
      }
    } catch (err) {
      await this.sensorModelService.updateSensorsOnGatewayClearSensorFailure(
        gateway.id,
      );
      this.logService.logError('Failed to clear sensor', { err });
      throw new Error(
        'Failed to clear sensor from Gateway. Make sure the Gateway is online !',
      );
    }
  }

  async validateAndGetGatewayById(gatewayId: string): Promise<Gateway> {
    try {
      const gateway = await this.gatewayModelService.findOneDetails(gatewayId);
      if (!gateway) {
        throw new HttpException('Invalid Gateway', HttpStatus.BAD_REQUEST);
      }
      return gateway;
    } catch (err) {
      throw err;
    }
  }

  async validateGatewayForPatientRegistering(
    gatewayDto: RegisterPatientGatewayDto,
    organizationId: string,
  ): Promise<Gateway> {
    try {
      const gateway = await this.gatewayModelService.findOneByName(
        gatewayDto.name,
        {
          organizationId,
        },
      );
      if (!gateway) {
        throw new HttpException(
          'No such gateway is registered on the organization',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (gateway.patientId) {
        if (gateway.patient.userId === gatewayDto.patientId) {
          throw new HttpException(
            'Gateway is already registerd',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          throw new HttpException(
            'This Gateway cannot be registerd to the patient',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      return gateway;
    } catch (err) {
      throw err;
    }
  }

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

  async validateSensorGatewayAssignmentAndGetDetails(
    gatewayId: string,
    sensorId: string,
  ): Promise<{ gateway: Gateway; sensor: Sensor }> {
    try {
      const [gateway, sensor] = await Promise.all([
        await this.validateAndGetGatewayById(gatewayId),
        await this.validateAndGetSensorById(sensorId),
      ]);
      if (!gateway.patient || !sensor.patient) {
        throw new HttpException(
          `${
            !gateway.patient ? 'Gateway' : 'Sensor'
          } is not assigned to any patient`,
          HttpStatus.BAD_REQUEST,
        );
      } else if (gateway.patient.patientId !== sensor.patient.patientId) {
        throw new HttpException(
          'This Sensor and Gateway are not assigned to the same patient',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return { gateway, sensor };
      }
    } catch (err) {
      throw err;
    }
  }

  getGatewayOnlineStatus(gateway: Gateway): boolean {
    try {
      let onlineStatus = false;
      if (gateway.lastConnectionTime) {
        // if (
        //   moment(moment().local().format('YYYY-MM-DDTHH:mm:ss')).diff(
        //     gateway.lastConnectionTime,
        //   ) <
        //   GATEWAY_ONLINE_BEFORE * 60000
        // ) {
        //   onlineStatus = true;
        // }
        if (
          new Date().getTime() -
            new Date(gateway.lastConnectionTime).getTime() <
          GATEWAY_ONLINE_BEFORE * 60000
        ) {
          onlineStatus = true;
        }
        this.logService.logInfo('Checking Gateway Online: ', {
          gatewayId: gateway.id,
          currentTime: new Date(),
          currentTimeGetTime: new Date().getTime(),
          gatewayTime: new Date(gateway.lastConnectionTime),
          gatewayTimeGetTime: new Date(gateway.lastConnectionTime).getTime(),
          onlineStatus,
        });
      }
      return onlineStatus;
    } catch (err) {
      throw err;
    }
  }

  async canGatewayBeAssignedToPatient(
    patient: User,
    gateway: Gateway,
  ): Promise<void> {
    try {
      const patientInfo = patient.patientInfo;
      // const sensorAttached = await this.sensorModelService.getPatientSensor(
      //   patientInfo.patientId,
      //   {
      //     connectionMode: DeviceConnectionMode.APPLICATION_MODE,
      //   },
      // );
      // if (sensorAttached) {
      //   throw new HttpException(
      //     'Please unassign the Sensor attached to patient in Application mode',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }
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
      } else if (gateway.patientId) {
        throw new HttpException(
          'Gateway is currently allocated',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (gateway.organizationId != patient.organizationId) {
        throw new HttpException(
          'Gateway can only be assigned to patients in the organization',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async automateGatewayAndSensorOnGatewayUpdate(gatewayId: string) {
    try {
      const gateway = await this.gatewayModelService.findOneDetails(gatewayId);
      if (gateway.type === GatewayType.GATEWAY) {
        if (!this.getGatewayOnlineStatus(gateway)) {
          throw new Error('Gateway is not Online for Pairing');
        }
        if (gateway.sensors && gateway.sensors.length > 0) {
          this.logService.logInfo(
            `GatewayData on automate gateway update: ${JSON.stringify(
              gateway,
            )}`,
          );
        }
        if (gateway.patientId && gateway.patient) {
          const assignedSensors = await this.sensorModelService.findByPatientId(
            gateway.patientId,
          );
          this.logService.logInfo(
            `Assigned sensors for the patient on automate gateway update: ${JSON.stringify(
              assignedSensors,
            )}`,
          );
          //patient can have only one Sensor.
          if (assignedSensors && assignedSensors.length > 0) {
            // TODO: Check assigned sensorStateStatus failed
            if (assignedSensors[0].gatewayId && assignedSensors[0].gateway) {
              if (assignedSensors[0].gatewayId === gateway.id) {
                //Assigned Sensor is already paired to the gateway
                this.logService.logInfo(
                  `Assigned sensor is paired to the Gateway`,
                  { gateway, sensor: assignedSensors[0] },
                );
                // automate for unassignment
                this.automateGatewayAndSensorUnassigning(
                  assignedSensors[0].id,
                ).catch((err) => {
                  this.logService.logError(
                    'Failed to automateGatewayAndSensorUnassigning on automateGatewayAndSensorOnGatewayUpdate',
                    {
                      error: err,
                      errMessage: err.message ? err.message : '',
                      gateway,
                      method:
                        'automateGatewayAndSensorOnGatewayUpdate function in gateway.service',
                    },
                  );
                });
              } else {
                // Worst Case that happen
                throw new Error(
                  'Assigned Sensor for the patient is connected to Some other Gateway',
                );
              }
            } else if (
              assignedSensors[0].lastProcessedState ===
                SensorProcessState.PAIR &&
              assignedSensors[0].processedStateStatus ===
                SensorProcessStateStatus.PROCESSING
            ) {
              this.logService.logInfo(
                `Existing pairing request found on automate gateway update`,
                { gateway, sensor: assignedSensors[0] },
              );
            } else if (
              assignedSensors[0].lastProcessedState ===
                SensorProcessState.UNPAIR &&
              assignedSensors[0].processedStateStatus ===
                SensorProcessStateStatus.SUCCESS
            ) {
              this.logService.logInfo(`Unpairing just happens`, {
                gateway,
                sensor: assignedSensors[0],
              });
            } else if (
              assignedSensors[0].sensorState === SensorState.ASSIGN &&
              assignedSensors[0].sensorStateStatus === SensorStateStatus.PENDING
            ) {
              this.logService.logInfo(
                `triggering pair sensor on automate gateway update`,
                { gateway, sensor: assignedSensors[0] },
              );
              // Automate pairing of Assigned Sensor with the Gateway
              await this.pairSensor(gateway, assignedSensors[0]).catch(
                (err) => {
                  throw err;
                },
              );
              // return await this.gatewayModelService.findOneDetails(gateway.id);
            }
          } else {
            throw new Error('No Sensor is assigned to the patient');
          }
        } else {
          throw new Error('Gateway is not paired to any patient');
        }
      } else {
        return gateway;
      }
    } catch (err) {
      throw err;
    }
  }

  async automateGatewayAndSensorUnassigning(sensorId: string): Promise<void> {
    try {
      const sensor = await this.sensorModelService.findOneDetails(sensorId);
      if (
        sensor.sensorState === SensorState.UNASSIGN &&
        sensor.sensorStateStatus === SensorStateStatus.PENDING
      ) {
        // Sensor is waiting to send unpair message to Gateway and un assign from patient
        if (
          sensor.lastProcessedState === SensorProcessState.UNPAIR &&
          sensor.processedStateStatus === SensorProcessStateStatus.PROCESSING
        ) {
          // message already send to Gateway and waiting for confirmation
          this.logService.logInfo(
            `Existing unpairing request found on automate sensor unassign`,
            { sensor },
          );
        } else {
          const gateway = sensor.gateway;
          const patientId = sensor.patientId;
          if (this.getGatewayOnlineStatus(gateway)) {
            // initiate unpair
            await this.unpairSensor(sensor, sensor.gateway, false).catch(
              (err) => {
                throw err;
              },
            );
            if (gateway.unassignRequest) {
              await this.unassignGateway(gateway, false);
            }
            await this.sensorService.unassignSensor(sensor, false);
            this.socketService.emitPatientDeviceUpdate('success', patientId);
          } else {
            throw new Error('Connected Gateway is not Online for unassigning');
          }
        }
      } else {
        this.logService.logInfo(`Sensor not ready to unassign`, { sensor });
        throw new Error('Sensor is not ready to unassign');
      }
    } catch (err) {
      throw err;
    }
  }
}
