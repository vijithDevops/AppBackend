import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { PatientResourceGuard } from './patient_resource.guard';
import { Role } from '../../models/user/entity/user.enum';

describe('PatientResourceGuard', () => {
  let guard: PatientResourceGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientResourceGuard],
    }).compile();

    guard = module.get<PatientResourceGuard>(PatientResourceGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  describe('patient role', () => {
    it("patientId matches user's id", () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.PATIENT,
            },
            query: {
              patientId: 'ABCD123900',
            },
            params: {
              patientId: 'ABCD123900',
            },
          }),
        }),
      });
      expect(guard.canActivate(mockContext)).toBeTruthy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
    it("patientId does not match user's id", () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.PATIENT,
            },
            query: {
              patientId: 'BC248990F',
            },
            params: {
              patientId: 'BC248990F',
            },
          }),
        }),
      });
      expect(guard.canActivate(mockContext)).toBeFalsy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
  describe('caretaker role', () => {
    it("patientId matches caretaker's patientId", () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.CARETAKER,
              caretakersPatient: {
                patientId: 'BC248990F',
              },
            },
            query: {
              patientId: 'BC248990F',
            },
            params: {
              patientId: 'BC248990F',
            },
          }),
        }),
      });
      expect(guard.canActivate(mockContext)).toBeTruthy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
    it("patientId does not match user's id", () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.CARETAKER,
              caretakersPatient: {
                patientId: 'BC248990F',
              },
            },
            query: {
              patientId: 'DHFK12349G',
            },
            params: {
              patientId: 'DHFK12349G',
            },
          }),
        }),
      });
      expect(guard.canActivate(mockContext)).toBeFalsy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
  it('admin role', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.DOCTOR,
          },
          query: {
            patientId: 'BC248990F',
          },
          params: {
            patientId: 'BC248990F',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('nurse role', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.NURSE,
          },
          query: {
            patientId: 'BC248990F',
          },
          params: {
            patientId: 'BC248990F',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
  it('doctor role', () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: Role.DOCTOR,
          },
          query: {
            patientId: 'BC248990F',
          },
          params: {
            patientId: 'BC248990F',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(mockContext.switchToHttp).toBeCalled();
  });
});
