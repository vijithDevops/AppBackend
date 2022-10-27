import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClinicianNote } from '../../../models/clinician_note/entity/clinician_note.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ClinicianNoteModelService } from '../../../models/clinician_note/clinician_note.model.service';

const mockRepository = {
  save: jest.fn().mockResolvedValue({
    id: 'JJANSNSJ10102',
    notes: 'First Note',
    isDiagnosis: false,
    isReminder: false,
    patientId: 'AJAJSSKAL123',
    doctorId: 'ABBNACSKS175',
    calendarId: 'NXJAKAK9292',
  }),
  createQueryBuilder: jest.fn(() => {
    return mockRepository;
  }),
  offset: jest.fn(() => {
    return mockRepository;
  }),
  limit: jest.fn(() => {
    return mockRepository;
  }),
  where: jest.fn(() => {
    return mockRepository;
  }),
  orderBy: jest.fn(() => {
    return mockRepository;
  }),
  getManyAndCount: jest.fn(() => {
    return [
      {
        id: 'JJANSNSJ10102',
        notes: 'First Note',
        isDiagnosis: false,
        isReminder: false,
        patientId: 'AJAJSSKAL123',
        doctorId: 'ABBNACSKS175',
        calendarId: 'NXJAKAK9292',
      },
      1,
    ];
  }),
  findOne: jest.fn().mockResolvedValue({
    id: 'JJANSNSJ10102',
    notes: 'First Note',
    isDiagnosis: false,
    isReminder: false,
    patientId: 'AJAJSSKAL123',
    doctorId: 'ABBNACSKS175',
    calendarId: 'NXJAKAK9292',
  }),
  softDelete: jest.fn(() => true),
};

describe('ClinicianNoteModelService', () => {
  let clinicianNoteService: ClinicianNoteModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicianNoteModelService,
        {
          provide: getRepositoryToken(ClinicianNote),
          useValue: mockRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        validate: jest.fn().mockResolvedValue({
          id: 'AHSHSH191920',
        }),
      })
      .compile();

    clinicianNoteService = module.get<ClinicianNoteModelService>(
      ClinicianNoteModelService,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(clinicianNoteService).toBeDefined();
  });

  it('create clinician note', async () => {
    expect(
      await clinicianNoteService.create({
        notes: 'First Note',
        patientId: 'AJAJSSKAL123',
        doctorId: 'ABBNACSKS175',
        calendarId: 'NXJAKAK9292',
      }),
    ).toEqual({
      id: 'JJANSNSJ10102',
      notes: 'First Note',
      isDiagnosis: false,
      isReminder: false,
      patientId: 'AJAJSSKAL123',
      doctorId: 'ABBNACSKS175',
      calendarId: 'NXJAKAK9292',
    });
    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.save).toBeCalledWith({
      notes: 'First Note',
      patientId: 'AJAJSSKAL123',
      doctorId: 'ABBNACSKS175',
      calendarId: 'NXJAKAK9292',
    });
  });

  it('update clinician note', async () => {
    jest.spyOn(mockRepository, 'save').mockResolvedValueOnce({
      id: 'JJANSNSJ10102',
      notes: 'Updated Note',
      isDiagnosis: false,
      isReminder: false,
      patientId: 'AJAJSSKAL123',
      doctorId: 'ABBNACSKS175',
      calendarId: 'NXJAKAK9292',
    });
    expect(
      await clinicianNoteService.update({
        id: 'JJANSNSJ10102',
        notes: 'Updated Note',
      }),
    ).toEqual({
      id: 'JJANSNSJ10102',
      notes: 'Updated Note',
      isDiagnosis: false,
      isReminder: false,
      patientId: 'AJAJSSKAL123',
      doctorId: 'ABBNACSKS175',
      calendarId: 'NXJAKAK9292',
    });
    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.save).toBeCalledWith({
      id: 'JJANSNSJ10102',
      notes: 'Updated Note',
    });
  });

  it('get note', async () => {
    expect(await clinicianNoteService.findOne('JJANSNSJ10102')).toEqual({
      id: 'JJANSNSJ10102',
      notes: 'First Note',
      isDiagnosis: false,
      isReminder: false,
      patientId: 'AJAJSSKAL123',
      doctorId: 'ABBNACSKS175',
      calendarId: 'NXJAKAK9292',
    });
    expect(mockRepository.findOne).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledWith('JJANSNSJ10102');
  });

  it('delete note', async () => {
    await clinicianNoteService.softDelete('JJANSNSJ10102');

    expect(mockRepository.softDelete).toBeCalledTimes(1);
    expect(mockRepository.softDelete).toBeCalledWith('JJANSNSJ10102');
    expect(mockRepository.softDelete).toReturnWith(true);
  });
  it('find all notes paginated', async () => {
    expect(
      await clinicianNoteService.findAllClinicianNotesPaginated(
        {
          skip: 20,
          limit: 10,
        },
        'AJAJSSKAL123',
      ),
    ).toEqual({
      data: {
        id: 'JJANSNSJ10102',
        notes: 'First Note',
        isDiagnosis: false,
        isReminder: false,
        patientId: 'AJAJSSKAL123',
        doctorId: 'ABBNACSKS175',
        calendarId: 'NXJAKAK9292',
      },
      totalCount: 1,
    });
    expect(mockRepository.createQueryBuilder).toBeCalledTimes(1);
    expect(mockRepository.offset).toBeCalledTimes(1);
    expect(mockRepository.limit).toBeCalledTimes(1);
    expect(mockRepository.where).toBeCalledTimes(1);
    expect(mockRepository.orderBy).toBeCalledTimes(1);
    expect(mockRepository.getManyAndCount).toBeCalledTimes(1);
  });
  it('delete note', async () => {
    await clinicianNoteService.softDelete('JJANSNSJ10102');

    expect(mockRepository.softDelete).toBeCalledTimes(1);
    expect(mockRepository.softDelete).toBeCalledWith('JJANSNSJ10102');
    expect(mockRepository.softDelete).toReturnWith(true);
  });
});
