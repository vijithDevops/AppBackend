import { HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto } from '../user/dto/index';
import { LocalAuthGuard } from '../../../common/guards/local-auth.guard';
import { Gender, Role } from '../../../models/user/entity/user.enum';

const loginUserDto = new LoginUserDto();
loginUserDto.username = 'admin';
loginUserDto.password = 'password';

const createAdmin = new CreateUserDto();
createAdmin.username = 'admin';
createAdmin.password = 'password';
createAdmin.firstName = 'admin';
createAdmin.middleName = null;
createAdmin.lastName = 'user';
createAdmin.email = 'admin@respiree.com';
createAdmin.phoneNumber = '6295858585';
createAdmin.gender = Gender.MALE;
createAdmin.address = {
  houseNumber: '1',
  streetName: 'huntley street',
  state: 'Singapore',
  postalCode: '29391',
  country: 'Singapore',
};
createAdmin.role = Role.ADMIN;

const createPatient = new CreateUserDto();
createPatient.username = 'patient';
createPatient.password = 'password';
createPatient.firstName = 'patient';
createPatient.middleName = null;
createPatient.lastName = 'user';
createPatient.email = 'patient@respiree.com';
createPatient.phoneNumber = '6295858585';
createPatient.gender = Gender.MALE;
createPatient.address = {
  houseNumber: '1',
  streetName: 'huntley street',
  state: 'Singapore',
  postalCode: '29391',
  country: 'Singapore',
};
createPatient.role = Role.PATIENT;
createPatient.dob = '1997-08-21';
createPatient.nokName = 'patientNOK';
createPatient.nokContactNumber = '6591919191';
createPatient.nokContactEmail = null;
createPatient.admissionDate = '2021-03-09';
createPatient.irisOnboardDate = '2021-03-09';
createPatient.dischargeDate = null;
createPatient.expectedEndDate = null;

const createDoctor = new CreateUserDto();
createDoctor.username = 'doctor';
createDoctor.password = 'password';
createDoctor.firstName = 'doctor';
createDoctor.middleName = null;
createDoctor.lastName = 'user';
createDoctor.email = 'doctor@respiree.com';
createDoctor.phoneNumber = '6295858585';
createDoctor.gender = Gender.MALE;
createDoctor.address = {
  houseNumber: '1',
  streetName: 'huntley street',
  state: 'Singapore',
  postalCode: '29391',
  country: 'Singapore',
};
createDoctor.role = Role.DOCTOR;
createDoctor.specialization = 'pulmonary';

const createCaretaker = new CreateUserDto();
createCaretaker.username = 'caretaker';
createCaretaker.password = 'password';
createCaretaker.firstName = 'caretaker';
createCaretaker.middleName = null;
createCaretaker.lastName = 'user';
createCaretaker.email = 'caretaker@respiree.com';
createCaretaker.phoneNumber = '66295858585';
createCaretaker.gender = Gender.MALE;
createCaretaker.address = {
  houseNumber: '1',
  streetName: 'huntley street',
  state: 'Singapore',
  postalCode: '29391',
  country: 'Singapore',
};
createCaretaker.role = Role.CARETAKER;
createCaretaker.relationship = 'guardian';
createCaretaker.patientUsername = 'patient';

const MOCK_JWT_TOKEN = 'AJ7HJ7192JZXS';

const MOCK_REQ = {
  user: {
    sername: 'admin',
    password: 'password',
  },
};

const mockUserService = {
  createUser: jest.fn().mockReturnValue(
    Promise.resolve({
      id: 'AKJSSNSN8182020',
      password: 'password',
    }),
  ),
  remove: jest.fn().mockReturnValue(() => true),
  createDoctorInfo: jest.fn().mockReturnValue(() => true),
  assignDoctorInCharge: jest.fn().mockReturnValue(() => true),
  createPatientInfo: jest.fn().mockReturnValue(() => true),
  createCaretakerInfo: jest.fn().mockReturnValue(() => true),
  findOneByUsername: jest.fn().mockReturnValue(() => true),
};

const mockAuthService = {
  login: jest.fn().mockReturnValue({
    access_token: MOCK_JWT_TOKEN,
    userData: {
      id: 'AKJSSNSN8182020',
      username: 'admin',
      role: 'admin',
    },
  }),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          return true;
        },
      })
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  // describe('register new user', () => {
  // it('register admin', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'AKJSSNSN8182020',
  // password: 'password',
  // role: 'admin',
  // }),
  // );
  // expect(await authController.register(createAdmin)).toEqual({
  // id: 'AKJSSNSN8182020',
  // role: 'admin',
  // });
  // expect(createUserSpy).toBeCalledTimes(1);
  // expect(createUserSpy).toBeCalledWith(createAdmin);
  // });
  // describe('register patient', () => {
  // it('register patient w/ doctorInChargeId', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'AKJSSNSN8182020',
  // password: 'password',
  // role: 'patient',
  // }),
  // );
  // expect(
  // await authController.register({
  // ...createPatient,
  // doctorInchargeId: 'BKASK1234J',
  // }),
  // ).toEqual({
  // id: 'AKJSSNSN8182020',
  // role: 'patient',
  // });
  // expect(createUserSpy).toBeCalledTimes(1);
  // expect(createUserSpy).toBeCalledWith({
  // username: 'patient',
  // password: 'password',
  // firstName: 'patient',
  // middleName: null,
  // lastName: 'user',
  // email: 'patient@respiree.com',
  // phoneNumber: '6295858585',
  // gender: Gender.MALE,
  // address: {
  // houseNumber: '1',
  // streetName: 'huntley street',
  // city: 'Singapore',
  // state: 'Singapore',
  // postalCode: '29391',
  // country: 'Singapore',
  // },
  // role: Role.PATIENT,
  // });
  // expect(mockUserService.assignDoctorInCharge).toBeCalledTimes(1);
  // expect(mockUserService.assignDoctorInCharge).toBeCalledWith({
  // patientId: 'AKJSSNSN8182020',
  // supervisorId: 'BKASK1234J',
  // });
  // expect(mockUserService.createPatientInfo).toBeCalledTimes(1);
  // expect(mockUserService.createPatientInfo).toBeCalledWith({
  // userId: 'AKJSSNSN8182020',
  // dob: '1997-08-21',
  // nokName: 'patientNOK',
  // nokContactNumber: '6591919191',
  // nokContactEmail: null,
  // admissionDate: '2021-03-09',
  // irisOnboardDate: '2021-03-09',
  // dischargeDate: null,
  // expectedEndDate: null,
  // });
  // });
  // it('register patient w/o doctorInChargeId', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'AKJSSNSN8182020',
  // password: 'password',
  // role: 'patient',
  // }),
  // );
  // expect(await authController.register(createPatient)).toEqual({
  // id: 'AKJSSNSN8182020',
  // role: 'patient',
  // });
  // expect(createUserSpy).toBeCalledTimes(1);
  // expect(createUserSpy).toBeCalledWith({
  // username: 'patient',
  // password: 'password',
  // firstName: 'patient',
  // middleName: null,
  // lastName: 'user',
  // email: 'patient@respiree.com',
  // phoneNumber: '6295858585',
  // gender: Gender.MALE,
  // address: {
  // houseNumber: '1',
  // streetName: 'huntley street',
  // city: 'Singapore',
  // state: 'Singapore',
  // postalCode: '29391',
  // country: 'Singapore',
  // },
  // role: Role.PATIENT,
  // });
  // expect(mockUserService.createPatientInfo).toBeCalledTimes(1);
  // expect(mockUserService.createPatientInfo).toBeCalledWith({
  // userId: 'AKJSSNSN8182020',
  // dob: '1997-08-21',
  // nokName: 'patientNOK',
  // nokContactNumber: '6591919191',
  // nokContactEmail: null,
  // admissionDate: '2021-03-09',
  // irisOnboardDate: '2021-03-09',
  // dischargeDate: null,
  // expectedEndDate: null,
  // });
  // });
  // });
  // it('register doctor', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'AKJSSNSN8182020',
  // password: 'password',
  // role: 'doctor',
  // }),
  // );
  // expect(await authController.register(createDoctor)).toEqual({
  // id: 'AKJSSNSN8182020',
  // role: 'doctor',
  // });
  // expect(createUserSpy).toBeCalledTimes(1);
  // expect(createUserSpy).toBeCalledWith({
  // username: 'doctor',
  // password: 'password',
  // firstName: 'doctor',
  // middleName: null,
  // lastName: 'user',
  // email: 'doctor@respiree.com',
  // phoneNumber: '6295858585',
  // gender: Gender.MALE,
  // address: {
  // houseNumber: '1',
  // streetName: 'huntley street',
  // city: 'Singapore',
  // state: 'Singapore',
  // postalCode: '29391',
  // country: 'Singapore',
  // },
  // role: Role.DOCTOR,
  // });
  // expect(mockUserService.createDoctorInfo).toBeCalledTimes(1);
  // expect(mockUserService.createDoctorInfo).toBeCalledWith({
  // userId: 'AKJSSNSN8182020',
  // specialization: 'pulmonary',
  // });
  // });

  // describe('register caretaker', () => {
  // it('success', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'AKJSSNSN8182020',
  // password: 'password',
  // role: 'caretaker',
  // }),
  // );
  // const findPatientSpy = jest
  // .spyOn(mockUserService, 'findOneByUsername')
  // .mockReturnValueOnce(
  // Promise.resolve({
  // id: 'BAAJANSNS1231023',
  // role: 'patient',
  // }),
  // );
  // expect(await authController.register(createCaretaker)).toEqual({
  // id: 'AKJSSNSN8182020',
  // role: 'caretaker',
  // });
  // expect(findPatientSpy).toBeCalledTimes(1);
  // expect(findPatientSpy).toBeCalledWith('patient');
  // expect(createUserSpy).toBeCalledTimes(1);
  // expect(createUserSpy).toBeCalledWith({
  // username: 'caretaker',
  // password: 'password',
  // firstName: 'caretaker',
  // middleName: null,
  // lastName: 'user',
  // email: 'caretaker@respiree.com',
  // phoneNumber: '66295858585',
  // gender: Gender.MALE,
  // address: {
  // houseNumber: '1',
  // streetName: 'huntley street',
  // city: 'Singapore',
  // state: 'Singapore',
  // postalCode: '29391',
  // country: 'Singapore',
  // },
  // role: Role.CARETAKER,
  // });
  // expect(mockUserService.createCaretakerInfo).toBeCalledTimes(1);
  // expect(mockUserService.createCaretakerInfo).toBeCalledWith({
  // caretakerId: 'AKJSSNSN8182020',
  // relationship: 'guardian',
  // patientId: 'BAAJANSNS1231023',
  // });
  // });
  // it('Invalid patient username', async () => {
  // const findPatientSpy = jest
  // .spyOn(mockUserService, 'findOneByUsername')
  // .mockReturnValueOnce(null);
  // try {
  // await authController.register(createCaretaker);
  // } catch (error) {
  // expect(error.message).toBe('Invalid patient username');
  // expect(error.status).toEqual(400);
  // }
  // expect(findPatientSpy).toBeCalledTimes(1);
  // });
  // });
  // });

  // describe('register errors', () => {
  // it('http conflict', async () => {
  // const createUserSpy = jest
  // .spyOn(mockUserService, 'createUser')
  // .mockRejectedValueOnce(
  // new HttpException('Conflict', HttpStatus.CONFLICT),
  // );
  // try {
  // await authController.register(createAdmin);
  // } catch (error) {
  // expect(error.message).toBe('Http Exception');
  // expect(error.status).toEqual(409);
  // }
  // expect(createUserSpy).toBeCalledTimes(1);
  // });
  // it('if role-specific info cannot be created', async () => {
  // const createPatientInfoSpy = jest
  // .spyOn(mockUserService, 'createPatientInfo')
  // .mockRejectedValueOnce(new Error('Cannot be created'));
  // try {
  // await authController.register(createPatient);
  // } catch (error) {
  // expect(error.message).toBe('Cannot be created');
  // expect(error.status).toEqual(400);
  // }
  // expect(createPatientInfoSpy).toBeCalledTimes(1);
  // expect(mockUserService.remove).toBeCalledTimes(1);
  // expect(mockUserService.remove).toBeCalledWith('AKJSSNSN8182020');
  // });
  // });

  describe('login user', () => {
    it('should return a JWT', async () => {
      expect(await authController.login(loginUserDto, MOCK_REQ)).toEqual({
        access_token: MOCK_JWT_TOKEN,
        userData: {
          id: 'AKJSSNSN8182020',
          username: 'admin',
          role: 'admin',
        },
      });
      expect(mockAuthService.login).toBeCalledTimes(1);
      expect(mockAuthService.login).toBeCalledWith(MOCK_REQ.user);
    });
  });
});
