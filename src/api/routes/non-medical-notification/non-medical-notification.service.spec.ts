import { Test, TestingModule } from '@nestjs/testing';
import { NonMedicalNotificationService } from './non-medical-notification.service';

describe('NonMedicalNotificationService', () => {
  let service: NonMedicalNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NonMedicalNotificationService],
    }).compile();

    service = module.get<NonMedicalNotificationService>(NonMedicalNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
