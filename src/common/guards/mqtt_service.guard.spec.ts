import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { MqttServiceGuard } from './mqtt_service.guard';
import { ConfigService } from '@nestjs/config';

const mockConfig = jest.fn().mockImplementation(() => ({
  get: (arg) => {
    const attr = {
      MQTT_SERVICE_API_KEY: '32eb565f-89aa-4317-a2c6-b7300227b350',
    };
    return attr[arg];
  },
}));

describe('MqttServiceGuard', () => {
  let guard: MqttServiceGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqttServiceGuard,
        {
          provide: ConfigService,
          useFactory: mockConfig,
        },
      ],
    }).compile();

    guard = module.get<MqttServiceGuard>(MqttServiceGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  it('Correct Api Key', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': '32eb565f-89aa-4317-a2c6-b7300227b350',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('Incorrect Api Key', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            X_API_KEY: '5reb5f5f-82c2-4312-a2c6-b45589l23l52',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeFalsy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
});
