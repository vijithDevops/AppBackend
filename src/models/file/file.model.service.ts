import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entity/file.entity';
import { CreateFile, IFindAllFiles } from './interfaces';

@Injectable()
export class FileModelService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async create(createFile: CreateFile): Promise<File> {
    return await this.fileRepository.save(createFile);
  }

  async findOne(id: string): Promise<File> {
    return await this.fileRepository
      .findOne({
        where: { id },
        relations: ['user'],
      })
      .catch((err) => {
        throw err;
      });
  }

  async verifyFileIds(ids: string[]): Promise<void> {
    const count = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.id IN (:...ids)', { ids })
      .getCount();
    if (count !== ids.length) {
      throw new Error('Invalid file Id found');
    }
  }

  async validateAndGetFiles(ids: string[]): Promise<File[]> {
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.id IN (:...ids)', { ids })
      .getMany();
    if (files.length !== ids.length) {
      throw new Error('Invalid file Id found');
    }
    return files;
  }

  async findAll(options: IFindAllFiles, userId: string) {
    const query = this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', {
        userId: userId,
      })
      .offset(options.skip)
      .limit(options.limit)
      .orderBy('file.createdAt', options.sort);
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async softDelete(id: string): Promise<void> {
    await this.fileRepository.softDelete(id);
  }
}
