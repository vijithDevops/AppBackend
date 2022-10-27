import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateCaretakerInfo, IUpdateCaretakerInfo } from './interfaces';
import { CaretakerInfo } from './entity/caretaker_info.entity';
import { LogService } from 'src/services/logger/logger.service';

@Injectable()
export class CaretakerInfoModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(CaretakerInfo)
    private caretakerInfoRepository: Repository<CaretakerInfo>,
  ) {}

  async createCaretakerInfo(
    createCaretakerInfo: ICreateCaretakerInfo,
  ): Promise<CaretakerInfo> {
    return this.caretakerInfoRepository.save(createCaretakerInfo);
  }

  async getOneByCaretakerId(caretakerId: string): Promise<CaretakerInfo> {
    return this.caretakerInfoRepository.findOne({
      caretakerId,
    });
  }

  async updateCaretakerInfo(
    caretakerId: string,
    updateData: IUpdateCaretakerInfo,
  ) {
    return this.caretakerInfoRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateData })
      .where('caretakerId =:caretakerId', { caretakerId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating caretaker Info', err);
      });
  }

  async removePatient(caretakerId: string) {
    return this.caretakerInfoRepository
      .createQueryBuilder()
      .update()
      .set({ patientId: null })
      .where('caretakerId =:caretakerId', { caretakerId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error deleting patient from caretaker', err);
      });
  }
}
