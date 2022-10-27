import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { SensorGuard } from './sensor.guard';
import { Role } from '../../models/user/entity/user.enum';
import { UserService } from '../../api/routes/user/user.service';
import { SensorService } from '../../api/routes/sensor/sensor.service';

const mockSensorService = {
  findOneBySensorAndPatientIdInt: jest.fn(() => {
    return Promise.resolve(true);
  }),
};

const mockUserService = {
  findPatientInfoByUserId: jest.fn(() => {
    return Promise.resolve({
      patientId: 'GBDHA129922',
    });
  }),
};

describe('SensorGuard', () => {
  let guard: SensorGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: SensorService,
          useValue: mockSensorService,
        },
      ],
    }).compile();

    guard = module.get<SensorGuard>(SensorGuard);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  it('admin role', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.ADMIN,
          },
          params: {
            id: 'SENSOR-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('nurse role', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.NURSE,
          },
          params: {
            id: 'SENSOR-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('doctor role', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.DOCTOR,
          },
          params: {
            id: 'SENSOR-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('patient role', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.PATIENT,
          },
          params: {
            id: 'SENSOR-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
    expect(mockSensorService.findOneBySensorAndPatientIdInt).toBeCalledTimes(1);
    expect(mockSensorService.findOneBySensorAndPatientIdInt).toBeCalledWith(
      'SENSOR-1822910',
      'ABCD123900',
    );
  });
  it('caretaker role', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.CARETAKER,
            caretakersPatient: {
              patientId: 'GBDHA129922',
            },
          },
          params: {
            id: 'SENSOR-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
    expect(mockUserService.findPatientInfoByUserId).toBeCalledTimes(1);
    expect(mockUserService.findPatientInfoByUserId).toBeCalledWith(
      'GBDHA129922',
    );
    expect(mockSensorService.findOneBySensorAndPatientIdInt).toBeCalledTimes(1);
    expect(mockSensorService.findOneBySensorAndPatientIdInt).toBeCalledWith(
      'SENSOR-1822910',
      'GBDHA129922',
    );
  });
});
