import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { GatewayGuard } from './gateway.guard';
import { Role } from '../../models/user/entity/user.enum';
import { UserService } from '../../api/routes/user/user.service';
import { GatewayService } from '../../api/routes/gateway/gateway.service';

const mockGatewayService = {
  findOneByGatewayAndPatientIdInt: jest.fn(() => {
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

describe('GatewayGuard', () => {
  let guard: GatewayGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: GatewayService,
          useValue: mockGatewayService,
        },
      ],
    }).compile();

    guard = module.get<GatewayGuard>(GatewayGuard);
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
            id: 'Gateway-1822910',
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
            id: 'Gateway-1822910',
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
            id: 'Gateway-1822910',
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
            id: 'Gateway-1822910',
          },
        }),
      }),
    });
    expect(await guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
    expect(mockGatewayService.findOneByGatewayAndPatientIdInt).toBeCalledTimes(
      1,
    );
    expect(mockGatewayService.findOneByGatewayAndPatientIdInt).toBeCalledWith(
      'Gateway-1822910',
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
            id: 'Gateway-1822910',
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
    expect(mockGatewayService.findOneByGatewayAndPatientIdInt).toBeCalledTimes(
      1,
    );
    expect(mockGatewayService.findOneByGatewayAndPatientIdInt).toBeCalledWith(
      'Gateway-1822910',
      'GBDHA129922',
    );
  });
});
