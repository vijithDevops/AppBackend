import { Test, TestingModule } from '@nestjs/testing';
import { DataServerService } from './data-server.service';

describe('DataServerService', () => {
  let service: DataServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataServerService],
    }).compile();

    service = module.get<DataServerService>(DataServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
