import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogService } from 'src/services/logger/logger.service';
import { Repository } from 'typeorm';
import { DoctorInfo } from './entity/doctor_info.entity';
import { ICreateDoctorInfo, IUpdateDoctorInfo } from './interfaces';

@Injectable()
export class DoctorInfoModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(DoctorInfo)
    private doctorInfoRepository: Repository<DoctorInfo>,
  ) {}

  async createDoctorInfo(
    createDoctorInfo: ICreateDoctorInfo,
  ): Promise<DoctorInfo> {
    return await this.doctorInfoRepository.save(createDoctorInfo);
  }

  async updateDoctorInfo(userId: string, updateObject: IUpdateDoctorInfo) {
    return this.doctorInfoRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateObject })
      .where('userId = :userId', { userId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating doctor info', err);
      });
  }
}
