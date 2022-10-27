import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { UserResourceGuard } from './user_resource.guard';
import { Role } from '../../models/user/entity/user.enum';
import { UserService } from '../../api/routes/user/user.service';

const mockUserService = {
  findOneDetails: jest.fn(),
};

describe('UserResourceGuard', () => {
  let guard: UserResourceGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResourceGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    guard = module.get<UserResourceGuard>(UserResourceGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  describe('patient role', () => {
    it("params id matches user's id", async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.PATIENT,
            },
            params: {
              id: 'ABCD123900',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeTruthy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
    it("params id does not match user's id", async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.PATIENT,
            },
            params: {
              id: 'BC248990F',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeFalsy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
  describe('caretaker role', () => {
    it("params id matches user's id", async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.CARETAKER,
            },
            params: {
              id: 'ABCD123900',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeTruthy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
    it("params id does not match user's id", async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.CARETAKER,
            },
            params: {
              id: 'BC248990F',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeFalsy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
  describe('doctor role', () => {
    it('resource role is patient', async () => {
      jest.spyOn(mockUserService, 'findOneDetails').mockResolvedValueOnce({
        role: Role.PATIENT,
      });
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.DOCTOR,
            },
            params: {
              id: 'ABCD123900',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeTruthy();
      expect(mockUserService.findOneDetails).toBeCalled();
      expect(mockContext.switchToHttp).toBeCalled();
    });
    it('params id matches user id', async () => {
      jest.spyOn(mockUserService, 'findOneDetails').mockResolvedValueOnce({
        role: Role.DOCTOR,
      });
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.DOCTOR,
            },
            params: {
              id: 'ABCD123900',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeTruthy();
      expect(mockUserService.findOneDetails).toBeCalled();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
  describe('admin/nurse role', () => {
    it('admin role', async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'ABCD123900',
              role: Role.ADMIN,
            },
            params: {
              id: 'ABCD123900',
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
              id: 'ABCD123900',
            },
          }),
        }),
      });
      expect(await guard.canActivate(mockContext)).toBeTruthy();
      expect(mockContext.switchToHttp).toBeCalled();
    });
  });
});
