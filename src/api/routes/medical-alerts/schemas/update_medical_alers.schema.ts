import * as Joi from 'joi';
import {
  ResolutionType,
  RiskReadingType,
  RiskStratification,
} from 'src/models/medical_alerts/entity/medical_alerts.enum';

export const UpdateMedicalAlertSchema = Joi.object({
  isActive: Joi.boolean().optional(),
  resolution: Joi.string()
    .valid(...Object.values(ResolutionType))
    .required(),
  riskStratification: Joi.string()
    .valid(...Object.values(RiskStratification))
    .required(),
  amberRiskApplicability: Joi.boolean()
    .when('riskStratification', {
      is: RiskStratification.CUSTOM,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when('riskStratification', {
      is: RiskStratification.BINARY,
      then: Joi.valid(false),
    })
    .when('riskStratification', {
      is: RiskStratification.TRAFFIC,
      then: Joi.valid(true),
    }),
  amberRiskReadingType: Joi.string()
    .valid(...Object.values(RiskReadingType))
    .when('amberRiskApplicability', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  amberRiskReadingOutOf: Joi.number().min(1).when('amberRiskApplicability', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  amberRiskReadingChoice: Joi.number()
    .min(1)
    .when('amberRiskApplicability', {
      is: true,
      then: Joi.required().when('amberRiskReadingType', {
        is: RiskReadingType.CONSECUTIVE,
        then: Joi.equal(Joi.ref('amberRiskReadingOutOf')),
        otherwise: Joi.number().max(Joi.ref('amberRiskReadingOutOf')),
      }),
      otherwise: Joi.optional(),
    }),
  notifyAmberRisk: Joi.boolean().when('amberRiskApplicability', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  redRiskApplicability: Joi.boolean()
    .when('riskStratification', {
      is: RiskStratification.CUSTOM,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when('riskStratification', {
      is: RiskStratification.BINARY,
      then: Joi.valid(true),
    })
    .when('riskStratification', {
      is: RiskStratification.TRAFFIC,
      then: Joi.valid(true),
    }),
  redRiskReadingType: Joi.string()
    .valid(...Object.values(RiskReadingType))
    .when('redRiskApplicability', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  redRiskReadingOutOf: Joi.number().min(1).when('redRiskApplicability', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  redRiskReadingChoice: Joi.number()
    .min(1)
    .when('redRiskApplicability', {
      is: true,
      then: Joi.required().when('redRiskReadingType', {
        is: RiskReadingType.CONSECUTIVE,
        then: Joi.equal(Joi.ref('redRiskReadingOutOf')),
        otherwise: Joi.number().max(Joi.ref('redRiskReadingOutOf')),
      }),
      otherwise: Joi.optional(),
    }),
  notifyRedRisk: Joi.boolean().when('redRiskApplicability', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  greenRiskApplicability: Joi.boolean()
    .when('riskStratification', {
      is: RiskStratification.CUSTOM,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when('riskStratification', {
      is: RiskStratification.BINARY,
      then: Joi.valid(true),
    })
    .when('riskStratification', {
      is: RiskStratification.TRAFFIC,
      then: Joi.valid(true),
    }),
  notifyGreenRisk: Joi.boolean().when('greenRiskApplicability', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  consecutiveAmberRisk: Joi.number().min(0).required(),
  reactivationHours: Joi.number().min(0).optional(),
  reactivationDays: Joi.number().min(0).optional(),
  vitalSigns: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      isApplicable: Joi.boolean().required(),
      amberValue: Joi.number().required(),
      redValue: Joi.number().required(),
    }),
  ),
  notificationMessageTemplates: Joi.object(),
});
