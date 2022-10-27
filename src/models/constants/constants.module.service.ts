import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constants } from './entity/constants.entity';

@Injectable()
export class ConstantsModelService {
  constructor(
    @InjectRepository(Constants)
    private constantsRepository: Repository<Constants>,
  ) {}

  async findOneByKey(key: string): Promise<Constants> {
    return await this.constantsRepository.findOne({ key });
  }
}
