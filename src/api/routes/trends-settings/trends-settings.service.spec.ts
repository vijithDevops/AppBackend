import { Test, TestingModule } from '@nestjs/testing';
import { TrendsSettingsService } from './trends-settings.service';

describe('TrendsSettingsService', () => {
  let service: TrendsSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrendsSettingsService],
    }).compile();

    service = module.get<TrendsSettingsService>(TrendsSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
