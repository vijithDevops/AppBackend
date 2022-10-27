import * as Joi from 'joi';
import { Gender, Role } from '../../../../models/user/entity/user.enum';

export const CreatePatientOrCaretakerSchema = Joi.object({
  verificationCode: Joi.string().optional(),
  username: Joi.string().alphanum().min(4).max(35).required(),
  password: Joi.string().required(),
  firstName: Joi.string().max(35).required(),
  middleName: Joi.string().max(35).optional().allow('').allow(null),
  lastName: Joi.string().max(35).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().max(20).required(),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .when('role', {
      is: Role.PATIENT,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  address: Joi.object({
    houseNumber: Joi.string().optional().allow('').allow(null),
    streetName: Joi.string().optional().allow('').allow(null),
    state: Joi.string().optional().allow('').allow(null),
    postalCode: Joi.string().optional().allow('').allow(null),
    country: Joi.string().optional().allow('').allow(null),
  }).when('role', {
    is: Role.PATIENT,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  organizationId: Joi.string().required(),
  role: Joi.string().valid(Role.PATIENT, Role.CARETAKER).required(),
  dob: Joi.date().when('role', {
    is: Role.PATIENT,
    then: Joi.required(),
    otherwise: Joi.optional().allow('').allow(null),
  }),
  diagnosis: Joi.string().optional().allow('').allow(null),
  medicationPrescription: Joi.string().optional().allow('').allow(null),
  height: Joi.number().optional().allow('').allow(null),
  weight: Joi.number().optional().allow('').allow(null),
  respirationRate: Joi.number().optional().allow('').allow(null),
  heartRate: Joi.number().optional().allow('').allow(null),
  spo2: Joi.number().optional().allow('').allow(null),
  nokName: Joi.string().when('role', {
    is: Role.PATIENT,
    then: Joi.required(),
    otherwise: Joi.optional().allow('').allow(null),
  }),
  nokContactNumber: Joi.string().when('role', {
    is: Role.PATIENT,
    then: Joi.required(),
    otherwise: Joi.optional().allow('').allow(null),
  }),
  nokContactEmail: Joi.string()
    .email()
    .when('role', {
      is: Role.PATIENT,
      then: Joi.required(),
      otherwise: Joi.optional().allow('').allow(null),
    }),
  admissionDate: Joi.date().optional().allow('').allow(null),
  irisOnboardDate: Joi.date().optional().allow('').allow(null),
  dischargeDate: Joi.date().optional().allow('').allow(null),
  expectedEndDate: Joi.date().optional().allow('').allow(null),
  doctorInchargeId: Joi.string().optional().allow('').allow(null),
  patientUsername: Joi.string().when('role', {
    is: Role.CARETAKER,
    then: Joi.required(),
    otherwise: Joi.optional().allow('').allow(null),
  }),
  relationship: Joi.string().optional().allow('').allow(null),
  // macId: Joi.string().optional().allow('').allow(null),
});
