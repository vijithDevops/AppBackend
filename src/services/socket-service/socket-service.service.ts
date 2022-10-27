import { Injectable } from '@nestjs/common';
import { LogService } from '../logger/logger.service';
import { AppSocketGateway } from '../../api/socket/socket.gateway';
import { CLIENT_SOCKET_EVENTS } from 'src/api/socket/constants/socket_events';
import { Gateway } from 'src/models/gateway/entity/gateway.entity';
import { Sensor } from 'src/models/sensor/entity/sensor.entity';
import { SensorModelService } from '../../models/sensor/sensor.model.service';
import { GatewayModelService } from '../../models/gateway/gateway.model.service';
import { PatientInfoModelService } from '../../models/patient_info/patient_info.model.service';
import { UserModelService } from '../../models/user/user.model.service';

@Injectable()
export class SocketService {
  constructor(
    private logService: LogService,
    private sensorModelService: SensorModelService,
    private gatewayModelService: GatewayModelService,
    private patientInfoModelService: PatientInfoModelService,
    private userModelService: UserModelService,
    private appSocketGateway: AppSocketGateway,
  ) {}

  async emitGatewayUpdateEvent(gatewayId: string, gateway?: Gateway) {
    this.logService.logInfo(
      `Emitting socket event: ${CLIENT_SOCKET_EVENTS.GATEWAY_STATUS} `,
    );
    this.appSocketGateway.server.emit(CLIENT_SOCKET_EVENTS.GATEWAY_STATUS, {
      gateway: gateway
        ? gateway
        : await this.gatewayModelService.getSingleGatewayDetails(gatewayId),
    });
  }

  async emitSensorUpdateEvent(sensorId: string, sensor?: Sensor) {
    this.logService.logInfo(
      `Emitting socket event: ${CLIENT_SOCKET_EVENTS.SENSOR_STATUS} `,
    );
    this.appSocketGateway.server.emit(CLIENT_SOCKET_EVENTS.SENSOR_STATUS, {
      sensor: sensor
        ? sensor
        : await this.sensorModelService.getSingleSensorDetails(sensorId),
    });
  }

  async emitSensorEvent(
    event: string,
    eventType: 'success' | 'failure',
    sensorId: string,
  ) {
    try {
      this.logService.logInfo(`Emitting sensor socket event: ${event} `);
      this.appSocketGateway.server.emit(event, {
        eventType,
        sensor: await this.sensorModelService.getSingleSensorDetails(sensorId),
      });
    } catch (error) {
      this.logService.logError(
        `Failed to emit sensor socket event: ${event}`,
        error,
      );
      throw error;
    }
  }

  async emitGatewayEvent(
    event: string,
    eventType: 'success' | 'failure',
    gatewayId: string,
  ) {
    try {
      this.logService.logInfo(`Emitting gateway socket event: ${event} `);
      this.appSocketGateway.server.emit(event, {
        eventType,
        gateway: await this.gatewayModelService.getSingleGatewayDetails(
          gatewayId,
        ),
      });
    } catch (error) {
      this.logService.logError(
        `Failed to emit gateway socket event: ${event}`,
        error,
      );
      throw error;
    }
  }

  async emitPatientDeviceUpdate(
    eventType: 'success' | 'failed',
    patientId: number,
  ) {
    try {
      this.logService.logInfo(
        `Emitting ${CLIENT_SOCKET_EVENTS.PATIENT_DEVICE_UPDATE} socket event`,
      );
      const patientInfo = await this.patientInfoModelService.findPatientInfoByPatientIdInt(
        patientId,
      );
      this.appSocketGateway.server.emit(
        CLIENT_SOCKET_EVENTS.PATIENT_DEVICE_UPDATE,
        {
          eventType,
          patientDetails: await this.userModelService.findOnePatientDetails(
            patientInfo.userId,
          ),
        },
      );
    } catch (error) {
      this.logService.logError(
        `Failed to emit gateway socket event: ${CLIENT_SOCKET_EVENTS.PATIENT_DEVICE_UPDATE}`,
        error,
      );
      throw error;
    }
  }
}
