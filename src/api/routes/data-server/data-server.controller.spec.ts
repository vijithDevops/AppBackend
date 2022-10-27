import { Test, TestingModule } from '@nestjs/testing';
import { DataServerController } from './data-server.controller';
import { DataServerService } from './data-server.service';

describe('DataServerController', () => {
  let controller: DataServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataServerController],
      providers: [DataServerService],
    }).compile();

    controller = module.get<DataServerController>(DataServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
