import { Test, TestingModule } from '@nestjs/testing';
import { StorageServiceService } from './storage-service.service';

describe('StorageServiceService', () => {
  let service: StorageServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageServiceService],
    }).compile();

    service = module.get<StorageServiceService>(StorageServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
