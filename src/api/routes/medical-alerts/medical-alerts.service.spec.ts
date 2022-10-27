import { Test, TestingModule } from '@nestjs/testing';
import { MedicalAlertsService } from './medical-alerts.service';

describe('MedicalAlertsService', () => {
  let service: MedicalAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalAlertsService],
    }).compile();

    service = module.get<MedicalAlertsService>(MedicalAlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
