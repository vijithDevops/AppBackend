import * as Joi from 'joi';

export const SuperCreateAdminSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(35).required(),
  password: Joi.string(),
  // .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&-+_=()]{5,128}$')),
  firstName: Joi.string().max(35).required(),
  middleName: Joi.string().max(35).optional(),
  lastName: Joi.string().max(35).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().max(20).required(),
  address: Joi.object({
    houseNumber: Joi.string().optional(),
    streetName: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    country: Joi.string().required(),
  }).required(),
  organizationId: Joi.string().required(),
});
