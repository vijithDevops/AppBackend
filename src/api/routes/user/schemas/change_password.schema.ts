import * as Joi from 'joi';

export const ChangePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&-+_=()]{5,128}$')),
  newPassword: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&-+_=()]{5,128}$')),
});
