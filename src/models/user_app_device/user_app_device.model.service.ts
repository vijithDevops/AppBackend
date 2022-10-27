import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAppDevice } from './entity/user_app_device.entity';
import { IFindUserDevice } from './interfaces';
import { ICreateUserAppDevice } from './interfaces/user_app_device.create';

@Injectable()
export class UserAppDeviceModelService {
  constructor(
    @InjectRepository(UserAppDevice)
    private userAppDeviceRepository: Repository<UserAppDevice>,
  ) {}

  async getAllDeviceOfUsers(userIds: string[]) {
    return this.userAppDeviceRepository
      .createQueryBuilder('userAppDevice')
      .where('userAppDevice.userId IN (:...userIds)', { userIds })
      .getMany()
      .catch((err) => {
        throw err;
      });
  }

  async findOneUserDevice(query: IFindUserDevice): Promise<UserAppDevice> {
    return this.userAppDeviceRepository.findOne({
      where: query,
    });
  }

  async addUserDevice(createData: ICreateUserAppDevice) {
    return this.userAppDeviceRepository.save(createData).catch((err) => {
      throw err;
    });
  }

  async updateUserDevice(data: UserAppDevice): Promise<UserAppDevice> {
    return this.userAppDeviceRepository.save(data).catch((err) => {
      throw err;
    });
  }

  async remove(id: string): Promise<void> {
    await this.userAppDeviceRepository.delete(id);
  }
}
