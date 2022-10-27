import { Test, TestingModule } from '@nestjs/testing';
import { EventNotificationController } from './event-notification.controller';
import { EventNotificationService } from './event-notification.service';

describe('EventNotificationController', () => {
  let controller: EventNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventNotificationController],
      providers: [EventNotificationService],
    }).compile();

    controller = module.get<EventNotificationController>(
      EventNotificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
