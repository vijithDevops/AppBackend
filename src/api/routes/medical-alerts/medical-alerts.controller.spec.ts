import { Test, TestingModule } from '@nestjs/testing';
import { MedicalAlertsController } from './medical-alerts.controller';
import { MedicalAlertsService } from './medical-alerts.service';

describe('MedicalAlertsController', () => {
  let controller: MedicalAlertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalAlertsController],
      providers: [MedicalAlertsService],
    }).compile();

    controller = module.get<MedicalAlertsController>(MedicalAlertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
