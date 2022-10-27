import { getUniqueArrayStringValues } from 'src/common/utils/helpers';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CalendarModelService } from 'src/models/calendar/calendar.model.service';
import { User } from 'src/models/user/entity/user.entity';
import { MedicationPrescriptionModelService } from '../../../models/medication_prescription/medication_prescription.model.service';
import { BreatingExercisePrescriptionModelService } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import {
  getStartOfMonthDate,
  getEndOfMonthDate,
  geStartOfToday,
  getStartOfDayDate,
} from '../../../common/utils/date_helper';
import { PatientAlertSettingsModelService } from '../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { Role } from 'src/models/user/entity/user.enum';
import { PatientAlertService } from '../../../services/patient-alerts/patient-alert.service';
import {
  PATIENT_DAILY_BASED_INPUTS,
  PATIENT_PRESCRIPTION_BASED_INPUTS,
} from 'src/config/master-data-constants';

@Injectable()
export class CalendarService {
  constructor(
    private readonly calendarModelService: CalendarModelService,
    private readonly medicationPrescriptionModelService: MedicationPrescriptionModelService,
    private readonly breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly patientAlertService: PatientAlertService,
  ) {}

  async getUserMonthlyCalendarEvents(user: User, date: Date) {
    const monthlyEventsRawData = await this.calendarModelService.getUserMonthlyCalendarRawData(
      user,
      date,
    );
    const calendarEvents = {};
    monthlyEventsRawData.forEach((calendar) => {
      calendarEvents[`${calendar.year}-${calendar.month}-${calendar.day}`] = {
        id: calendar.id,
        date: calendar.date,
        day: calendar.day,
        month: calendar.month,
        year: calendar.year,
        patientMedicationInputs: calendar.medication_inputs
          ? parseInt(calendar.medication_inputs)
          : 0,
        patientSymptomsInputs: calendar.symptoms_inputs
          ? parseInt(calendar.symptoms_inputs)
          : 0,
        patientQuestionnaireInputs: calendar.questionnaire_inputs
          ? parseInt(calendar.questionnaire_inputs)
          : 0,
        patientHealthInputs: calendar.health_inputs
          ? parseInt(calendar.health_inputs)
          : 0,
        clinicianNotes: calendar.clinician_notes
          ? parseInt(calendar.clinician_notes)
          : 0,
        patientNotes: calendar.patient_notes
          ? parseInt(calendar.patient_notes)
          : 0,
        userAppointments:
          parseInt(calendar.face_to_face_appointments) +
          parseInt(calendar.video_call_appointments),
        faceToFaceAppointments: parseInt(calendar.face_to_face_appointments),
        videoCallAppointments: parseInt(calendar.video_call_appointments),
      };
    });
    return calendarEvents;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserMonthlyCalendarAlerData(user: User, date: Date) {
    if (user.role === Role.PATIENT) {
      const patientAlertSettings = await this.patientAlertSettingsModelService.findByPatientId(
        user.id,
      );
      return {
        medication: await this.patientAlertService.getPatientPrescriptionBasedInputsMissedAlert(
          PATIENT_PRESCRIPTION_BASED_INPUTS.MEDICATION_INPUT,
          user,
          patientAlertSettings,
        ),
        symptoms: await this.patientAlertService.getPatientDailyBasedInputsMissedAlert(
          PATIENT_DAILY_BASED_INPUTS.SYMPTOMS_INPUT,
          user,
          patientAlertSettings,
        ),
      };
    } else {
      return {};
    }
  }

  async getPatientComplianceMonthlyCalendarEvents(patient: User, date: Date) {
    const monthStartDate = getStartOfMonthDate(date);
    const monthEndDate = getEndOfMonthDate(date);
    const patientCompliance = await this.getPatientComplianceBetweenDates(
      patient,
      monthStartDate,
      monthEndDate,
    );
    return {
      complianceCalendar: patientCompliance.complianceCalendar,
      monthlyComplianceCount: patientCompliance.complianceCount,
    };
  }

  async getPatientComplianceBetweenDates(
    patient: User,
    fromDate: Date,
    toDate: Date,
  ) {
    const startOfToday = geStartOfToday();
    const startOfFromDate = getStartOfDayDate(fromDate);
    const startOfToDate = getStartOfDayDate(toDate);
    const patinetCreatedAt = patient.createdAt;
    const [
      monthlyEventsRawData,
      medicationPrescriptions,
      breathingPrescriptions,
    ] = await Promise.all([
      this.calendarModelService.getPatientInputsCountOnCalendarBetweenDatesRawData(
        patient.id,
        startOfFromDate,
        startOfToDate,
      ),
      this.medicationPrescriptionModelService.getPatientMedicationPrescriptionsBetweenDates(
        {
          patientId: patient.id,
          options: { startDate: startOfFromDate, endDate: startOfToDate },
        },
      ),
      this.breatingExercisePrescriptionModelService.getPatientBreathingPrescriptionsBetweenDates(
        {
          patientId: patient.id,
          options: { startDate: startOfFromDate, endDate: startOfToDate },
        },
      ),
    ]);
    const monthlyEventsObj = {};
    const patientComplianceCalendar = {};
    const patientCompliance = {
      healthInputMissed: 0,
      symptomsInputMissed: 0,
      questionnaireInputMissed: 0,
      medicationInputMissed: 0,
      breathingInputMissed: 0,
    };
    monthlyEventsRawData.forEach((data) => {
      monthlyEventsObj[`${data.year}-${data.month}-${data.day}`] = data;
    });
    for (
      let startDate = new Date(startOfFromDate);
      startDate <= startOfToDate && startDate < startOfToday;
      startDate.setDate(startDate.getDate() + 1)
    ) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      const day = startDate.getDate();
      const compliance = {
        healthInputMissed: true,
        symptomsInputMissed: true,
        questionnaireInputMissed: true,
        medicationInputMissed: true,
        breathingInputMissed: true,
      };
      if (startDate < patinetCreatedAt) {
        // no compliance before joining date
        compliance.healthInputMissed = false;
        compliance.symptomsInputMissed = false;
        compliance.questionnaireInputMissed = false;
        compliance.medicationInputMissed = false;
        compliance.breathingInputMissed = false;
      } else {
        if (monthlyEventsObj[`${year}-${month}-${day}`]) {
          const patientCalendarInputs =
            monthlyEventsObj[`${year}-${month}-${day}`];
          compliance.healthInputMissed =
            parseInt(patientCalendarInputs.health_inputs) === 0 ? true : false;
          compliance.symptomsInputMissed =
            parseInt(patientCalendarInputs.symptoms_inputs) === 0
              ? true
              : false;
          compliance.questionnaireInputMissed =
            parseInt(patientCalendarInputs.questionnaire_inputs) === 0
              ? true
              : false;
          compliance.medicationInputMissed =
            parseInt(patientCalendarInputs.medication_inputs) === 0
              ? this.checkAnyPrescriptionValidForTheDay(
                  medicationPrescriptions,
                  startDate,
                )
              : false;
          compliance.breathingInputMissed =
            parseInt(patientCalendarInputs.breathing_inputs) === 0
              ? this.checkAnyPrescriptionValidForTheDay(
                  breathingPrescriptions,
                  startDate,
                )
              : false;
        } else {
          compliance.medicationInputMissed = this.checkAnyPrescriptionValidForTheDay(
            medicationPrescriptions,
            startDate,
          );
          compliance.breathingInputMissed = this.checkAnyPrescriptionValidForTheDay(
            breathingPrescriptions,
            startDate,
          );
        }
        // count each compliances
        patientCompliance.healthInputMissed += compliance.healthInputMissed
          ? 1
          : 0;
        patientCompliance.symptomsInputMissed += compliance.symptomsInputMissed
          ? 1
          : 0;
        patientCompliance.questionnaireInputMissed += compliance.questionnaireInputMissed
          ? 1
          : 0;
        patientCompliance.medicationInputMissed += compliance.medicationInputMissed
          ? 1
          : 0;
        patientCompliance.breathingInputMissed += compliance.breathingInputMissed
          ? 1
          : 0;
      }
      patientComplianceCalendar[`${year}-${month}-${day}`] = compliance;
    }
    return {
      complianceCalendar: patientComplianceCalendar,
      complianceCount: patientCompliance,
    };
  }

  checkAnyPrescriptionValidForTheDay(
    prescriptions: { startDate?: Date; endDate?: Date }[],
    date: Date,
  ): boolean {
    return prescriptions.find((prescription) => {
      const startDateValidity = prescription.startDate
        ? getStartOfDayDate(prescription.startDate) <= date
        : true;
      const endDateValidity = prescription.endDate
        ? date <= getStartOfDayDate(prescription.endDate)
        : true;
      // getStartOfDayDate(prescription.startDate) <= date &&
      // date <= getStartOfDayDate(prescription.endDate),
      return startDateValidity && endDateValidity;
    })
      ? true
      : false;
  }

  async getPatientSymptomScoresBetweenDates(
    patientId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    try {
      const startOfFromDate = getStartOfDayDate(fromDate);
      const startOfToDate = getStartOfDayDate(toDate);
      const startOfToday = geStartOfToday();
      const patientSymptomsInputs = await this.calendarModelService.getPatientSymptomsBetweenDates(
        patientId,
        startOfFromDate,
        startOfToDate,
      );
      const patientSymptomsInputsObj = {};
      patientSymptomsInputs.forEach((data) => {
        patientSymptomsInputsObj[`${data.year}-${data.month}-${data.day}`] =
          data.patientSymptomsInputs;
      });
      const dateArray = [];
      const symptomScores = {
        coughingScore: [],
        phlegmScore: [],
        chestTightnessScore: [],
        breathlessnessScore: [],
        limitedActivityScore: [],
        troubleSleepingScore: [],
        energyScore: [],
        totalScore: [],
      };
      for (
        let startDate = new Date(startOfFromDate);
        startDate <= startOfToDate && startDate < startOfToday;
        startDate.setDate(startDate.getDate() + 1)
      ) {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();
        const date = `${year}-${month}-${day}`;
        dateArray.push(date);
        if (
          patientSymptomsInputsObj[date] &&
          patientSymptomsInputsObj[date].length > 0
        ) {
          const symptomsInput = patientSymptomsInputsObj[date][0];
          symptomScores.coughingScore.push(symptomsInput.coughingScore);
          symptomScores.phlegmScore.push(symptomsInput.phlegmScore);
          symptomScores.chestTightnessScore.push(
            symptomsInput.chestTightnessScore,
          );
          symptomScores.breathlessnessScore.push(
            symptomsInput.breathlessnessScore,
          );
          symptomScores.limitedActivityScore.push(
            symptomsInput.limitedActivityScore,
          );
          symptomScores.troubleSleepingScore.push(
            symptomsInput.troubleSleepingScore,
          );
          symptomScores.energyScore.push(symptomsInput.energyScore);
          symptomScores.totalScore.push(symptomsInput.totalScore);
        } else {
          // No inputs are entered for the date. So filling those values with -1
          symptomScores.coughingScore.push(-1);
          symptomScores.phlegmScore.push(-1);
          symptomScores.chestTightnessScore.push(-1);
          symptomScores.breathlessnessScore.push(-1);
          symptomScores.limitedActivityScore.push(-1);
          symptomScores.troubleSleepingScore.push(-1);
          symptomScores.energyScore.push(-1);
          symptomScores.totalScore.push(-1);
        }
      }
      return {
        dateArray,
        ...symptomScores,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPatientQuestionnaireInputScoresBetweenDates(
    patientId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    try {
      const startOfFromDate = getStartOfDayDate(fromDate);
      const startOfToDate = getStartOfDayDate(toDate);
      const startOfToday = geStartOfToday();
      const patientQuestionnaireInputs = await this.calendarModelService.getPatientQuestionnaireInputBetweenDates(
        patientId,
        startOfFromDate,
        startOfToDate,
      );
      const patientQuestionnaireInputsObj = {};
      const result = {
        keywords: [],
        data: {
          dateArray: [],
          totalScore: [],
        },
      };
      const inputMaps = [];
      patientQuestionnaireInputs.forEach((questionnaireInput) => {
        if (
          questionnaireInput.patientQuestionnaireInput &&
          questionnaireInput.patientQuestionnaireInput.length > 0
        ) {
          const dateInput = {
            questionInput: questionnaireInput.patientQuestionnaireInput[0],
            keywords: [],
            keywordInputs: {},
          };
          if (questionnaireInput.patientQuestionnaireInput[0].patientInputs) {
            questionnaireInput.patientQuestionnaireInput[0].patientInputs.forEach(
              (keywordInput) => {
                dateInput.keywords.push(keywordInput.keyword);
                dateInput.keywordInputs[keywordInput.keyword] =
                  keywordInput.input;
                inputMaps.push(keywordInput.keyword);
              },
            );
          }
          patientQuestionnaireInputsObj[
            `${questionnaireInput.year}-${questionnaireInput.month}-${questionnaireInput.day}`
          ] = dateInput;
        }
      });
      result.keywords = getUniqueArrayStringValues(inputMaps);
      result.keywords.forEach((keyword) => {
        result.data[keyword] = [];
      });
      for (
        let startDate = new Date(startOfFromDate);
        startDate <= startOfToDate && startDate <= startOfToday;
        startDate.setDate(startDate.getDate() + 1)
      ) {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();
        const date = `${year}-${month}-${day}`;
        result.data.dateArray.push(date);
        if (patientQuestionnaireInputsObj[date]) {
          result.keywords.forEach((keyword) => {
            if (patientQuestionnaireInputsObj[date].keywordInputs[keyword]) {
              result.data[keyword].push(
                patientQuestionnaireInputsObj[date].keywordInputs[keyword],
              );
            } else {
              result.data[keyword].push(-1);
            }
          });
          result.data.totalScore.push(
            patientQuestionnaireInputsObj[date].questionInput.totalScore,
          );
        } else {
          // No inputs are entered for the date. So filling those values with -1
          result.keywords.forEach((keyword) => {
            result.data[keyword].push(-1);
          });
          result.data.totalScore.push(-1);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
