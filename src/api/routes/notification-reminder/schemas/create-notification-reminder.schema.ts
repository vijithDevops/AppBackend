import * as Joi from 'joi';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';

export const CreateNotificationReminderSchema = Joi.object({
  patientId: Joi.string().required(),
  type: Joi.string()
    .valid(
      ReminderEvent.MEDICATION_REMINDER,
      ReminderEvent.BREATHING_EXERCISE_REMINDER,
    )
    .required(),
  reminderTimes: Joi.array()
    .items(
      Joi.object()
        .keys({
          hour: Joi.number().integer().min(0).max(23).required(),
          minute: Joi.number().integer().min(0).max(59).required(),
        })
        .min(1),
    )
    .required(),
  medicationPrescriptionId: Joi.string().when('type', {
    is: ReminderEvent.MEDICATION_REMINDER,
    then: Joi.required(),
  }),
  breathingPrescriptionId: Joi.string().when('type', {
    is: ReminderEvent.BREATHING_EXERCISE_REMINDER,
    then: Joi.required(),
  }),
});
