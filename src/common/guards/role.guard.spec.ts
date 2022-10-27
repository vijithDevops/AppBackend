import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './role.guard';
import { Role } from '../../models/user/entity/user.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  it('should return without any specified roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(null);

    const mockContext = createMock<ExecutionContext>({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: 'admin',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(reflector.getAllAndOverride).toBeCalled();
    expect(mockContext.switchToHttp).not.toBeCalled();
  });
  it('should return true with correct role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const mockContext = createMock<ExecutionContext>({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: 'admin',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeTruthy();
    expect(reflector.getAllAndOverride).toBeCalled();
    expect(mockContext.switchToHttp).toBeCalledTimes(1);
    expect(mockContext.switchToHttp().getRequest()).toEqual({
      user: {
        id: 'ABCD123900',
        role: 'admin',
      },
    });
  });
  it('should return false without correct role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const mockContext = createMock<ExecutionContext>({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'ABCD123900',
            role: 'patient',
          },
        }),
      }),
    });
    expect(guard.canActivate(mockContext)).toBeFalsy();
    expect(reflector.getAllAndOverride).toBeCalled();
    expect(mockContext.switchToHttp).toBeCalledTimes(1);
    expect(mockContext.switchToHttp().getRequest()).toEqual({
      user: {
        id: 'ABCD123900',
        role: 'patient',
      },
    });
  });
});
