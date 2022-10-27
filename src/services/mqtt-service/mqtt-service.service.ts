import { Injectable, HttpService } from '@nestjs/common';
import { LogService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { IClearSensors, IPairSensor, IUnpairSensor } from './interfaces';

@Injectable()
export class MQTTService {
  constructor(
    private logService: LogService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async pairSensor(pairSensor: IPairSensor) {
    try {
      return await this.httpService
        .post(
          this.configService.get('MQTT_SERVICE_URL') + '/pair-sensor',
          pairSensor,
        )
        .toPromise();
    } catch (err) {
      this.logService.logError('Failed at MQTT sensor pairing', { err });
      throw err;
    }
  }

  async unpairSensor(unpairSensor: IUnpairSensor) {
    try {
      return await this.httpService
        .post(
          this.configService.get('MQTT_SERVICE_URL') + '/unpair-sensor',
          unpairSensor,
        )
        .toPromise();
    } catch (err) {
      this.logService.logError('Failed at MQTT sensor unpairing', { err });
      throw err;
    }
  }

  async clearSensors(clearSensors: IClearSensors) {
    try {
      return await this.httpService
        .post(
          this.configService.get('MQTT_SERVICE_URL') + '/clear-sensors',
          clearSensors,
        )
        .toPromise();
    } catch (err) {
      this.logService.logError('Failed at MQTT clear sensor', { err });
      throw err;
    }
  }
}
