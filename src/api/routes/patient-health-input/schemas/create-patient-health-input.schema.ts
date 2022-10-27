import * as Joi from 'joi';

export const CreatePatientHealthInputSchema = Joi.object({
  bloodPressureSystolic: Joi.number().required(),
  bloodPressureDiastolic: Joi.number().required(),
  weight: Joi.number().required(),
  bloodSugar: Joi.number().required(),
});
