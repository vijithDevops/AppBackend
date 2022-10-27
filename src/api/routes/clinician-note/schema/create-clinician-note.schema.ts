import * as Joi from 'joi';

export const CreateClinicianNoteSchema = Joi.object({
  notes: Joi.string().required(),
  isDiagnosis: Joi.boolean().optional(),
  isReminder: Joi.boolean().optional(),
  reminderAt: Joi.string().when('isReminder', {
    is: true,
    then: Joi.required(),
  }),
  patientId: Joi.string().required(),
});
