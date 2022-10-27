import * as Joi from 'joi';

export const RegisterClientPatientSchema = Joi.object({
  reg_code: Joi.string().required(),
  patient_id: Joi.string().alphanum().min(4).max(35).required(),
  sensor_id: Joi.string().required(),
});
