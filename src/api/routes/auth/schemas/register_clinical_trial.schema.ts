import * as Joi from 'joi';

export const RegisterClinicalTrialSchema = Joi.object({
  organizationId: Joi.string().required(),
  username: Joi.string().alphanum().min(4).max(35).required(),
});
