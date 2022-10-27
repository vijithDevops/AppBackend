import { Test, TestingModule } from '@nestjs/testing';
import { PatientRecordsService } from './patient-records.service';

describe('PatientRecordsService', () => {
  let service: PatientRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientRecordsService],
    }).compile();

    service = module.get<PatientRecordsService>(PatientRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
