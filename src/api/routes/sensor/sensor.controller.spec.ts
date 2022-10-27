import { Test, TestingModule } from '@nestjs/testing';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { UserService } from '../user/user.service';
import { UpdateSensorMqttDto } from './dto';
import { MqttServiceGuard } from '../../../common/guards/mqtt_service.guard';

const mockSensorService = {
  findOneByMacId: jest.fn().mockResolvedValue({
    id: 'JJANSNSJ10102',
  }),
  update: jest.fn((data) => {
    return data;
  }),
};
describe('SensorController', () => {
  let sensorController: SensorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorController],
      providers: [
        {
          provide: SensorService,
          useValue: mockSensorService,
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(MqttServiceGuard)
      .useValue({})
      .compile();

    sensorController = module.get<SensorController>(SensorController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sensorController).toBeDefined();
  });

  describe('Updating sensor from MqttService', () => {
    it('Sensor was just registered with gateway', async () => {
      jest.spyOn(mockSensorService, 'findOneByMacId').mockReturnValueOnce(
        Promise.resolve({
          id: 'JJANSNSJ10102',
          isRegistered: false,
        }),
      );
      const updateSensorMqttDto = new UpdateSensorMqttDto();
      updateSensorMqttDto.macId = '8caab5a40986';
      updateSensorMqttDto.isRegistered = true;
      updateSensorMqttDto.registeredTime = new Date('2021-04-13T05:32:55');
      updateSensorMqttDto.lastConnectionTime = new Date('2021-04-13T05:32:55');
      expect(
        await sensorController.updateSensorMqtt(updateSensorMqttDto),
      ).toEqual({
        id: 'JJANSNSJ10102',
        isRegistered: true,
        lastConnectionTime: new Date('2021-04-13T05:32:55'),
        registeredTime: new Date('2021-04-13T05:32:55'),
      });
    });
    it('Sensor is not registered with gateway', async () => {
      jest.spyOn(mockSensorService, 'findOneByMacId').mockReturnValueOnce(
        Promise.resolve({
          id: 'JJANSNSJ10102',
          isRegistered: true,
          lastConnectionTime: new Date('2021-04-12T04:13:42'),
        }),
      );
      const updateSensorMqttDto = new UpdateSensorMqttDto();
      updateSensorMqttDto.macId = '8caab5a40986';
      updateSensorMqttDto.isRegistered = false;
      expect(
        await sensorController.updateSensorMqtt(updateSensorMqttDto),
      ).toEqual({
        id: 'JJANSNSJ10102',
        isRegistered: false,
        registeredTime: null,
      });
    });
    it('Sensor was already registered with gateway', async () => {
      jest.spyOn(mockSensorService, 'findOneByMacId').mockReturnValueOnce(
        Promise.resolve({
          id: 'JJANSNSJ10102',
          isRegistered: true,
          lastConnectionTime: new Date('2021-04-12T04:13:42'),
        }),
      );
      const updateSensorMqttDto = new UpdateSensorMqttDto();
      updateSensorMqttDto.macId = '8caab5a40986';
      updateSensorMqttDto.isRegistered = true;
      updateSensorMqttDto.lastConnectionTime = new Date('2021-04-13T05:32:55');
      updateSensorMqttDto.registeredTime = new Date('2021-04-13T04:32:55');
      expect(
        await sensorController.updateSensorMqtt(updateSensorMqttDto),
      ).toEqual({
        id: 'JJANSNSJ10102',
        lastConnectionTime: new Date('2021-04-13T05:32:55'),
      });
    });
  });
});
