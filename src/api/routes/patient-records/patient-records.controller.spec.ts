import { Test, TestingModule } from '@nestjs/testing';
import { PatientRecordsController } from './patient-records.controller';
import { PatientRecordsService } from './patient-records.service';

describe('PatientRecordsController', () => {
  let controller: PatientRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientRecordsController],
      providers: [PatientRecordsService],
    }).compile();

    controller = module.get<PatientRecordsController>(PatientRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
