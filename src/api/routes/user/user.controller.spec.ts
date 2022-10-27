import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from '../user/dto/index';
import { Role } from '../../../models/user/entity/user.enum';

const updateAdmin = new UpdateUserDto();
updateAdmin.firstName = '1998-10-12';
updateAdmin.role = Role.ADMIN;

const updatePatient = new UpdateUserDto();
updatePatient.dob = '1998-10-12';
updatePatient.role = Role.PATIENT;

const updateDoctor = new UpdateUserDto();
updateDoctor.specialization = 'cardiology';
updateDoctor.role = Role.DOCTOR;

const updateCaretaker = new UpdateUserDto();
updateCaretaker.relationship = 'mother';
updateCaretaker.role = Role.CARETAKER;

const mockUserService = {
  findOne: jest.fn(),
  update: jest.fn(),
  updateDoctorInfo: jest.fn(),
  updateCaretakerInfo: jest.fn(),
  updatePatientInfo: jest.fn(),
  getUpdatePatientInfoObj: jest.fn((updateObj) => {
    return { dob: '1998-10-12' };
  }),
  getDoctor: jest.fn(),
  getDoctorInCharge: jest.fn(),
  updateDoctorInCharge: jest.fn(),
  assignDoctorInCharge: jest.fn(),
};

describe('AuthController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {};
          return true;
        },
      })
      .compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('update users', () => {
    it('update admin', async () => {
      (mockUserService.findOne = jest.fn().mockImplementation((id) =>
        Promise.resolve({
          id: id,
        }),
      )),
        expect(
          await userController.updateUser({ id: 'AJ7HJ7192JZXS' }, updateAdmin),
        ).toEqual({ status: 200, message: 'SUCCESS' });
      expect(mockUserService.findOne).toBeCalledTimes(1);
      expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
      expect(mockUserService.update).toBeCalledTimes(1);
      expect(mockUserService.update).toBeCalledWith(
        'AJ7HJ7192JZXS',
        updateAdmin,
      );
    });
    it('update doctor', async () => {
      (mockUserService.findOne = jest.fn().mockImplementation((id) =>
        Promise.resolve({
          id: id,
          specialization: 'pulmonary',
          role: 'doctor',
        }),
      )),
        expect(
          await userController.updateUser(
            { id: 'AJ7HJ7192JZXS' },
            updateDoctor,
          ),
        ).toEqual({ status: 200, message: 'SUCCESS' });
      expect(mockUserService.findOne).toBeCalledTimes(1);
      expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
      expect(mockUserService.update).toBeCalledTimes(1);
      expect(mockUserService.update).toBeCalledWith(
        'AJ7HJ7192JZXS',
        updateDoctor,
      );
      expect(mockUserService.updateDoctorInfo).toBeCalledTimes(1);
      expect(mockUserService.updateDoctorInfo).toBeCalledWith('AJ7HJ7192JZXS', {
        specialization: 'cardiology',
      });
    });
    it('update caretaker', async () => {
      (mockUserService.findOne = jest.fn().mockImplementation((id) =>
        Promise.resolve({
          id: id,
          relationship: 'guardian',
          role: 'caretaker',
        }),
      )),
        expect(
          await userController.updateUser(
            { id: 'AJ7HJ7192JZXS' },
            updateCaretaker,
          ),
        ).toEqual({ status: 200, message: 'SUCCESS' });
      expect(mockUserService.findOne).toBeCalledTimes(1);
      expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
      expect(mockUserService.update).toBeCalledTimes(1);
      expect(mockUserService.update).toBeCalledWith(
        'AJ7HJ7192JZXS',
        updateCaretaker,
      );
      expect(mockUserService.updateCaretakerInfo).toBeCalledTimes(1);
      expect(mockUserService.updateCaretakerInfo).toBeCalledWith(
        'AJ7HJ7192JZXS',
        {
          relationship: 'mother',
        },
      );
    });
    describe('update patient without doctorInchargeId', () => {
      it('successfully', async () => {
        (mockUserService.findOne = jest.fn().mockImplementation((id) =>
          Promise.resolve({
            id: id,
            dob: '1998-10-12',
            role: 'patient',
          }),
        )),
          expect(
            await userController.updateUser(
              { id: 'AJ7HJ7192JZXS' },
              updatePatient,
            ),
          ).toEqual({ status: 200, message: 'SUCCESS' });
        expect(mockUserService.findOne).toBeCalledTimes(1);
        expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
        expect(mockUserService.update).toBeCalledTimes(1);
        expect(mockUserService.update).toBeCalledWith(
          'AJ7HJ7192JZXS',
          updatePatient,
        );
        expect(mockUserService.updatePatientInfo).toBeCalledTimes(1);
        expect(mockUserService.updatePatientInfo).toBeCalledWith(
          'AJ7HJ7192JZXS',
          {
            dob: '1998-10-12',
          },
        );
      });
      it('error: cannot get doctorData', async () => {
        (mockUserService.findOne = jest.fn().mockImplementation((id) =>
          Promise.resolve({
            id: id,
            dob: '1998-10-12',
            role: 'patient',
            doctorInchargeId: 'BKASK1234J',
          }),
        )),
          (mockUserService.update = jest.fn().mockReturnValueOnce(true));
        mockUserService.getDoctor = jest.fn().mockReturnValueOnce(false);
        try {
          await userController.updateUser(
            { id: 'AJ7HJ7192JZXS' },
            {
              dob: '1998-10-12',
              role: Role.PATIENT,
              doctorInchargeId: 'BKASK1234J',
            },
          );
        } catch (error) {
          expect(error.message).toBe('Invalid doctor in incharge mapping');
          expect(error.status).toEqual(400);
        }
        expect(mockUserService.update).toBeCalledTimes(1);
        expect(mockUserService.getDoctor).toBeCalledTimes(1);
        expect(mockUserService.updatePatientInfo).not.toHaveBeenCalled();
      });
    }),
      it('update patient with doctorInChargeId', async () => {
        (mockUserService.getDoctor = jest
          .fn()
          .mockReturnValueOnce({ id: 'BKASK1234J7', role: 'doctor' })),
          (mockUserService.getDoctorInCharge = jest.fn().mockReturnValueOnce({
            patientId: 'AJ7HJ7192JZXS',
            doctorId: 'BKASK1234J7',
            isInCharge: true,
          })),
          (mockUserService.findOne = jest.fn().mockImplementation((id) =>
            Promise.resolve({
              id: id,
              dob: '1998-10-12',
              role: 'patient',
              doctorInchargeId: 'BKASK1234J',
            }),
          )),
          expect(
            await userController.updateUser(
              { id: 'AJ7HJ7192JZXS' },
              {
                dob: '1998-10-12',
                role: Role.PATIENT,
                doctorInchargeId: 'BKASK1234J',
              },
            ),
          ).toEqual({ status: 200, message: 'SUCCESS' });
        expect(mockUserService.findOne).toBeCalledTimes(1);
        expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
        expect(mockUserService.update).toBeCalledTimes(1);
        expect(mockUserService.update).toBeCalledWith('AJ7HJ7192JZXS', {
          ...updatePatient,
          doctorInchargeId: 'BKASK1234J',
        });
        expect(mockUserService.getDoctorInCharge).toBeCalledTimes(1);
        expect(mockUserService.getDoctorInCharge).toBeCalledWith(
          'AJ7HJ7192JZXS',
        );
        expect(mockUserService.getDoctor).toBeCalledTimes(1);
        expect(mockUserService.getDoctor).toBeCalledWith('BKASK1234J');
        expect(mockUserService.updateDoctorInCharge).toBeCalledTimes(1);
        expect(mockUserService.updateDoctorInCharge).toBeCalledWith(
          'AJ7HJ7192JZXS',
          {
            userId: 'BKASK1234J',
          },
        );

        expect(mockUserService.updatePatientInfo).toBeCalledTimes(1);
        expect(mockUserService.updatePatientInfo).toBeCalledWith(
          'AJ7HJ7192JZXS',
          {
            dob: '1998-10-12',
          },
        );
      });
    it('update patient with doctorInChargeId but w/o InChargeMapping', async () => {
      (mockUserService.getDoctor = jest
        .fn()
        .mockReturnValueOnce({ id: 'BKASK1234J7', role: 'doctor' })),
        (mockUserService.assignDoctorInCharge = jest
          .fn()
          .mockReturnValueOnce(false)),
        (mockUserService.findOne = jest.fn().mockImplementation((id) =>
          Promise.resolve({
            id: id,
            dob: '1998-10-12',
            role: 'patient',
            doctorInchargeId: 'BKASK1234J',
          }),
        )),
        expect(
          await userController.updateUser(
            { id: 'AJ7HJ7192JZXS' },
            {
              dob: '1998-10-12',
              role: Role.PATIENT,
              doctorInchargeId: 'BKASK1234J',
            },
          ),
        ).toEqual({ status: 200, message: 'SUCCESS' });
      expect(mockUserService.findOne).toBeCalledTimes(1);
      expect(mockUserService.findOne).toBeCalledWith('AJ7HJ7192JZXS');
      expect(mockUserService.update).toBeCalledTimes(1);
      expect(mockUserService.update).toBeCalledWith('AJ7HJ7192JZXS', {
        ...updatePatient,
        doctorInchargeId: 'BKASK1234J',
      });
      expect(mockUserService.getDoctorInCharge).toBeCalledTimes(1);
      expect(mockUserService.getDoctorInCharge).toBeCalledWith('AJ7HJ7192JZXS');
      expect(mockUserService.getDoctor).toBeCalledTimes(1);
      expect(mockUserService.getDoctor).toBeCalledWith('BKASK1234J');
      expect(mockUserService.assignDoctorInCharge).toBeCalledTimes(1);
      expect(mockUserService.assignDoctorInCharge).toBeCalledWith({
        patientId: 'AJ7HJ7192JZXS',
        userId: 'BKASK1234J',
      });

      expect(mockUserService.updatePatientInfo).toBeCalledTimes(1);
      expect(mockUserService.updatePatientInfo).toBeCalledWith(
        'AJ7HJ7192JZXS',
        {
          dob: '1998-10-12',
        },
      );
    });
  });
  describe('register errors', () => {
    it('http conflict', async () => {
      mockUserService.findOne = jest
        .fn()
        .mockRejectedValueOnce(
          new HttpException('Invalid user id', HttpStatus.BAD_REQUEST),
        );
      try {
        await userController.updateUser({ id: 'AJ7HJ7192JZXS' }, updateAdmin);
      } catch (error) {
        expect(error.message).toBe('Invalid user id');
        expect(error.status).toEqual(400);
      }
      expect(mockUserService.findOne).toBeCalledTimes(1);
    });
  });
});
