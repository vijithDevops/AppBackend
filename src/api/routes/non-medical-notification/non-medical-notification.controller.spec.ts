import { Test, TestingModule } from '@nestjs/testing';
import { NonMedicalNotificationController } from './non-medical-notification.controller';
import { NonMedicalNotificationService } from './non-medical-notification.service';

describe('NonMedicalNotificationController', () => {
  let controller: NonMedicalNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NonMedicalNotificationController],
      providers: [NonMedicalNotificationService],
    }).compile();

    controller = module.get<NonMedicalNotificationController>(NonMedicalNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
