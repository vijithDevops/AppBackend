import { Test, TestingModule } from '@nestjs/testing';
import { BreathingExercisePrescriptionService } from './breathing-exercise-prescription.service';

describe('BreathingExercisePrescriptionService', () => {
  let service: BreathingExercisePrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BreathingExercisePrescriptionService],
    }).compile();

    service = module.get<BreathingExercisePrescriptionService>(
      BreathingExercisePrescriptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
