import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import {
  RegisterPatientOrCaretakerDto,
  CreateUserDto,
  UpdateUserDto,
} from './dto';
import { User } from '../../../models/user/entity/user.entity';
import { Role } from '../../../models/user/entity/user.enum';
import { UserModelService } from '../../../models/user/user.model.service';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';
import { DoctorInfoModelService } from '../../../models/doctor_info/doctor_info.model.service';
import { PatientSupervisionMappingModelService } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.service';
import { CaretakerInfoModelService } from '../../../models/caretaker_info/caretaker_info.model.service';
import { geStartOfToday } from '../../../common/utils/date_helper';
import { CalendarService } from '../calendar/calendar.service';
import { LogService } from 'src/services/logger/logger.service';
@Injectable()
export class UserService {
  constructor(
    private readonly userModelService: UserModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly doctorInfoModelService: DoctorInfoModelService,
    private readonly caretakerInfoModelService: CaretakerInfoModelService,
    private readonly patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
    private readonly calendarService: CalendarService,
    private logService: LogService,
  ) {}

  async removeDoctorInCharge(patientId: string): Promise<boolean> {
    const patientInchargeData = await this.patientSupervisionMappingModelService.getDoctorInCharge(
      patientId,
    );
    if (patientInchargeData) {
      await this.patientSupervisionMappingModelService.delete(
        patientInchargeData.id,
      );
      return true;
    } else {
      return false;
    }
  }

  async updatePatientDoctorIncharge(
    patientId: string,
    doctorId: string,
  ): Promise<void> {
    try {
      const [patientSupervisors, doctorData] = await Promise.all([
        this.patientSupervisionMappingModelService.findPatientSupervisors(
          patientId,
        ),
        this.userModelService.getDoctor(doctorId),
      ]);
      if (!doctorData) {
        throw new Error('Invalid doctor to make patient incharge');
      }
      // existing relation of patient with doctor
      const doctorMapping = patientSupervisors.find(
        (mapping) => mapping.userId === doctorData.id,
      );
      // existing incharge
      const existingIncharge = patientSupervisors.find(
        (mapping) => mapping.isIncharge === true,
      );
      if (doctorMapping) {
        if (!doctorMapping.isIncharge) {
          // update is incharge of doctorMapping to true
          // update existingIncharge is incharge mapping to false
          await Promise.all([
            this.patientSupervisionMappingModelService.updateInchargeByMappingId(
              doctorMapping.id,
              true,
            ),
            this.patientSupervisionMappingModelService.updateInchargeByMappingId(
              existingIncharge.id,
              false,
            ),
          ]);
        } // No need to update for the else case(Same doctorIcherge is trying to update)
      } else {
        const updatePromises = [];
        // update existingIncharge is incharge mapping to false
        // add new mapping with the doctor and make incharge
        if (existingIncharge) {
          updatePromises.push(
            this.patientSupervisionMappingModelService.updateInchargeByMappingId(
              existingIncharge.id,
              false,
            ),
          );
        }
        updatePromises.push(
          this.patientSupervisionMappingModelService.assignSupervisors([
            {
              patientId,
              userId: doctorId,
              isIncharge: true,
            },
          ]),
        );
        await Promise.all(updatePromises);
      }
    } catch (error) {
      throw error;
    }
  }

  async validateAndFindUsersById(
    ids: string[],
    rolesFilter?: Role[],
  ): Promise<User[]> {
    const usersData = await this.userModelService.findByIds(ids, rolesFilter);
    if (usersData && usersData.length === ids.length) {
      return usersData;
    } else {
      throw new HttpException(
        `Invalid Id found for role ${rolesFilter}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private isEmptyValueInObjectKey(
    object: { [key: string]: any },
    key: string,
  ): boolean {
    if (key in object && (object[key] === null || object[key] === '')) {
      return true;
    } else {
      return false;
    }
  }

  getUpdatePatientInfoObj(updateObject: UpdateUserDto) {
    try {
      const patientData = {};
      updateObject.dob ? (patientData['dob'] = new Date(updateObject.dob)) : '';
      updateObject.nokName
        ? (patientData['nokName'] = updateObject.nokName)
        : '';
      updateObject.nokContactNumber
        ? (patientData['nokContactNumber'] = updateObject.nokContactNumber)
        : '';
      updateObject.nokContactEmail
        ? (patientData['nokContactEmail'] = updateObject.nokContactEmail)
        : '';
      updateObject.admissionDate
        ? (patientData['admissionDate'] = new Date(updateObject.admissionDate))
        : this.isEmptyValueInObjectKey(updateObject, 'admissionDate')
        ? (patientData['admissionDate'] = null)
        : '';
      updateObject.irisOnboardDate
        ? (patientData['irisOnboardDate'] = new Date(
            updateObject.irisOnboardDate,
          ))
        : this.isEmptyValueInObjectKey(updateObject, 'irisOnboardDate')
        ? (patientData['irisOnboardDate'] = null)
        : '';
      updateObject.dischargeDate
        ? (patientData['dischargeDate'] = new Date(updateObject.dischargeDate))
        : this.isEmptyValueInObjectKey(updateObject, 'dischargeDate')
        ? (patientData['dischargeDate'] = null)
        : '';
      updateObject.expectedEndDate
        ? (patientData['expectedEndDate'] = new Date(
            updateObject.expectedEndDate,
          ))
        : this.isEmptyValueInObjectKey(updateObject, 'expectedEndDate')
        ? (patientData['expectedEndDate'] = null)
        : '';
      updateObject.diagnosis
        ? (patientData['diagnosis'] = updateObject.diagnosis)
        : this.isEmptyValueInObjectKey(updateObject, 'diagnosis')
        ? (patientData['diagnosis'] = null)
        : '';
      updateObject.medicationPrescription
        ? (patientData['medicationPrescription'] =
            updateObject.medicationPrescription)
        : this.isEmptyValueInObjectKey(updateObject, 'medicationPrescription')
        ? (patientData['medicationPrescription'] = null)
        : '';
      updateObject.height
        ? (patientData['height'] = updateObject.height)
        : this.isEmptyValueInObjectKey(updateObject, 'height')
        ? (patientData['height'] = null)
        : '';
      updateObject.weight
        ? (patientData['weight'] = updateObject.weight)
        : this.isEmptyValueInObjectKey(updateObject, 'weight')
        ? (patientData['weight'] = null)
        : '';
      updateObject.respirationRate
        ? (patientData['respirationRate'] = updateObject.respirationRate)
        : this.isEmptyValueInObjectKey(updateObject, 'respirationRate')
        ? (patientData['respirationRate'] = null)
        : '';
      updateObject.heartRate
        ? (patientData['heartRate'] = updateObject.heartRate)
        : this.isEmptyValueInObjectKey(updateObject, 'heartRate')
        ? (patientData['heartRate'] = null)
        : '';
      updateObject.spo2
        ? (patientData['spo2'] = updateObject.spo2)
        : this.isEmptyValueInObjectKey(updateObject, 'spo2')
        ? (patientData['spo2'] = null)
        : '';
      return patientData;
    } catch (error) {
      this.logService.logError('Error creating update patient details object', {
        updateObject,
        error,
      });
      throw error;
    }
  }

  async createPatientDetails(
    newUser: User,
    registerPatientDto: RegisterPatientOrCaretakerDto | CreateUserDto,
  ) {
    try {
      const patientData = {
        userId: newUser.id,
        dob: registerPatientDto.dob,
        diagnosis: registerPatientDto.diagnosis || null,
        medicationPrescription:
          registerPatientDto.medicationPrescription || null,
        height: registerPatientDto.height || null,
        weight: registerPatientDto.weight || null,
        respirationRate: registerPatientDto.respirationRate || null,
        heartRate: registerPatientDto.heartRate || null,
        spo2: registerPatientDto.spo2 || null,
        nokName: registerPatientDto.nokName || null,
        nokContactNumber: registerPatientDto.nokContactNumber || null,
        nokContactEmail: registerPatientDto.nokContactEmail || null,
        admissionDate: registerPatientDto.admissionDate || null,
        irisOnboardDate: registerPatientDto.irisOnboardDate || null,
        dischargeDate: registerPatientDto.dischargeDate || null,
        expectedEndDate: registerPatientDto.expectedEndDate || null,
      };
      // let appSensor;
      // if (registerPatientDto.macId) {
      //   appSensor = await this.validateSensorOnPatientRegisteration(
      //     newUser,
      //     registerPatientDto.macId,
      //   );
      // }
      const doctorInchargeId = registerPatientDto.doctorInchargeId;
      let supervisor;
      if (doctorInchargeId) {
        const supervisorUser = await this.userModelService.findOne(
          doctorInchargeId,
          Role.DOCTOR,
        );
        if (!supervisorUser) {
          throw new Error('Invalid doctor incharge user');
        }
        if (
          supervisorUser.organizationId !== registerPatientDto.organizationId
        ) {
          throw new Error(
            'The doctor incharge user must belongs to the same organization',
          );
        }
        supervisor = await this.patientSupervisionMappingModelService.assignSupervisors(
          [
            {
              patientId: newUser.id,
              userId: doctorInchargeId,
              isIncharge: true,
            },
          ],
        );
      }
      const patientInfo = await this.patientInfoModelService
        .createPatientInfo(patientData)
        .catch(async (err) => {
          if (supervisor && supervisor.length > 0) {
            await this.patientSupervisionMappingModelService.deleteById(
              supervisor[0].id,
            );
          }
          throw err;
        });
      newUser.patientInfo = patientInfo;
      // if (appSensor) {
      //   // assigning sensor defaultly on application mode
      //   await this.sensorService.assignSensorPatient(
      //     appSensor,
      //     newUser,
      //     DeviceConnectionMode.APPLICATION_MODE,
      //   );
      //   // update patient registraion on 3rd party
      //   this.sendPatientRegistrationToThirdParty(newUser, {
      //     patient_id: newUser.patientInfo.patientId,
      //     sensor_id: appSensor.macId,
      //     username: newUser.username,
      //     password: registerPatientDto.password,
      //   });
      // }
    } catch (error) {
      throw error;
    }
  }

  async createCaretakerDetails(
    newUser: User,
    registerCaretakerDto: RegisterPatientOrCaretakerDto | CreateUserDto,
  ) {
    try {
      const patientInfo = await this.userModelService.findOneByUsername(
        registerCaretakerDto.patientUsername,
        { role: Role.PATIENT },
      );
      if (!patientInfo) {
        throw new HttpException(
          'Invalid patient username',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (patientInfo.organizationId !== registerCaretakerDto.organizationId) {
        throw new HttpException(
          'Patient does not belongs to the organization',
          HttpStatus.BAD_REQUEST,
        );
      }
      const caretakerData = {
        caretakerId: newUser.id,
        relationship: registerCaretakerDto.relationship,
        patientId: patientInfo.id,
      };
      await this.caretakerInfoModelService.createCaretakerInfo(caretakerData);
      await this.patientSupervisionMappingModelService.assignSupervisors([
        {
          patientId: patientInfo.id,
          userId: newUser.id,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async createDoctorDetails(newUser: User, createDoctorDto: CreateUserDto) {
    const doctorData = {
      userId: newUser.id,
      specialization: createDoctorDto.specialization,
    };
    await this.doctorInfoModelService.createDoctorInfo(doctorData);
  }

  async getSupervisorPatientIds(userId: string): Promise<string[]> {
    const supervisorMappings = await this.patientSupervisionMappingModelService.findByUserId(
      userId,
    );
    return supervisorMappings.map((mappings) => mappings.patientId);
  }

  async getPatientCompliance(patient: User) {
    const startDate = geStartOfToday();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = geStartOfToday();
    const compliance = await this.calendarService.getPatientComplianceBetweenDates(
      patient,
      startDate,
      endDate,
    );
    return compliance.complianceCount;
  }

  //TODO: changes for role and role mapping
  // async assignRole(userId: string, roleId: string): Promise<void> {
  // return await this.connection
  // .createQueryBuilder()
  // .relation(User, 'roles')
  // .of(userId)
  // .add([roleId]);
  // }
}
