import { Test, TestingModule } from '@nestjs/testing';
import { UserAppDeviceController } from './user-app-device.controller';
import { UserAppDeviceService } from './user-app-device.service';

describe('UserAppDeviceController', () => {
  let controller: UserAppDeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAppDeviceController],
      providers: [UserAppDeviceService],
    }).compile();

    controller = module.get<UserAppDeviceController>(UserAppDeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
