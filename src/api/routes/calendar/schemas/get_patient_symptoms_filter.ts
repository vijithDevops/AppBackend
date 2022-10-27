import * as Joi from 'joi';

export const GetPatientSymptomsFilterSchema = Joi.object({
  patientId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
});
