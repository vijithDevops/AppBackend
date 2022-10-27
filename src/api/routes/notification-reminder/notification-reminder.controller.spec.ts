import { Test, TestingModule } from '@nestjs/testing';
import { NotificationReminderController } from './notification-reminder.controller';
import { NotificationReminderService } from './notification-reminder.service';

describe('NotificationReminderController', () => {
  let controller: NotificationReminderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationReminderController],
      providers: [NotificationReminderService],
    }).compile();

    controller = module.get<NotificationReminderController>(
      NotificationReminderController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
