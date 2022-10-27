import { Test, TestingModule } from '@nestjs/testing';
import { EventSchedulerService } from './event-scheduler.service';

describe('EventSchedulerService', () => {
  let service: EventSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventSchedulerService],
    }).compile();

    service = module.get<EventSchedulerService>(EventSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
