import { Test, TestingModule } from '@nestjs/testing';
import { TrendsSettingsController } from './trends-settings.controller';

describe('TrendsSettingsController', () => {
  let controller: TrendsSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrendsSettingsController],
    }).compile();

    controller = module.get<TrendsSettingsController>(TrendsSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
