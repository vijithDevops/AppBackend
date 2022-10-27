import { Test, TestingModule } from '@nestjs/testing';
import { BreathingExercisePrescriptionController } from './breathing-exercise-prescription.controller';
import { BreathingExercisePrescriptionService } from './breathing-exercise-prescription.service';

describe('BreathingExercisePrescriptionController', () => {
  let controller: BreathingExercisePrescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BreathingExercisePrescriptionController],
      providers: [BreathingExercisePrescriptionService],
    }).compile();

    controller = module.get<BreathingExercisePrescriptionController>(
      BreathingExercisePrescriptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
