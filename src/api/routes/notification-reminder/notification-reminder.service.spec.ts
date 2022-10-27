import { Test, TestingModule } from '@nestjs/testing';
import { NotificationReminderService } from './notification-reminder.service';

describe('NotificationReminderService', () => {
  let service: NotificationReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationReminderService],
    }).compile();

    service = module.get<NotificationReminderService>(NotificationReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
