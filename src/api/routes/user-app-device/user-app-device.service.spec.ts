import { Test, TestingModule } from '@nestjs/testing';
import { UserAppDeviceService } from './user-app-device.service';

describe('UserAppDeviceService', () => {
  let service: UserAppDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAppDeviceService],
    }).compile();

    service = module.get<UserAppDeviceService>(UserAppDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
