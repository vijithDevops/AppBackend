import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserAppDevice } from '../user_app_device/entity/user_app_device.entity';

import { TrendsSettings, UserTrendsSettings, DefaultTrendsSettings } from './entity/trends_settings.entity';
import { IUpdateTrendsSettings } from './interfaces/update_trends_settings.interface';
import { ICreateuserTrendsSettings } from './interfaces/create_user_trends_settings.interface';

@Injectable()
export class TrendsSettingsModelService {
  constructor(
    @InjectRepository(TrendsSettings)
    private trendsSettingsRepository: Repository<TrendsSettings>,
  ) {}

  async update(
    updateTrendsSettings: IUpdateTrendsSettings,
  ): Promise<TrendsSettings> {
    return await this.trendsSettingsRepository.save(updateTrendsSettings);
  }

  async findOne(patientId: string, userId: string) {
    const data = await this.trendsSettingsRepository.findOne({
      where: { patientId: patientId, userId: userId },
    });
    if (!data) {
      return [];
    }
    return data;
  }
}


@Injectable()
export class DefaultTrendsSettingsModelService{
  constructor(
    @InjectRepository(DefaultTrendsSettings)
    private readonly defaultTrendsSettingsRepository: Repository<DefaultTrendsSettings>,
  ){}
  async findOne(tableName:string){
    let defaultTS:any = await this.defaultTrendsSettingsRepository.findOne(
      { where: { tableName:tableName } }
    ) 
    if (defaultTS !== undefined && Array.isArray(defaultTS["columnsOrder"])) {
      return [defaultTS["columnsOrder"], defaultTS['requirePatientId']]
    } else {
      return [undefined, undefined]
    }
  }
}

@Injectable()
export class UserTrendsSettingsModelService{
  constructor(
    @InjectRepository(UserTrendsSettings)
    private readonly userTrendsSettingsRepository: Repository<UserTrendsSettings>,
  ){}
  create(createUserTrendsSettings:ICreateuserTrendsSettings){//ICreateuserTrendsSettings
    const UserTS = this.userTrendsSettingsRepository.create(createUserTrendsSettings);
    return this.userTrendsSettingsRepository.save(UserTS)
  }
  async update(id:string, updateUserTrendsSettings:ICreateuserTrendsSettings){
    const UserTS = await this.userTrendsSettingsRepository.preload({
      id:id,
      ...updateUserTrendsSettings
    })
    if(!UserTS){
      throw new NotFoundException(`UserTrendsSettings #${id} not found`)
    }
    return this.userTrendsSettingsRepository.save(UserTS)
  }
  async findOneId(userId:string, tableName:string, patientId:string = "-1"){
    // used for providing id value to update
    let UserTS:any = await this.userTrendsSettingsRepository.findOne(
      { where: { userId:userId, tableName:tableName, patientId:patientId } }
    ) 
    if (UserTS !== undefined) {
      return UserTS["id"]
    } else {
      return undefined
    }
  }
  async findOneCol(userId:string, tableName:string, patientId:string = "-1"){
    // used for retrieving actual payload
    let UserTS:any = await this.userTrendsSettingsRepository.findOne(
      { where: { userId:userId, tableName:tableName, patientId:patientId } }
    ) 
    if(UserTS !== undefined && Array.isArray(UserTS["columnsOrder"])){
      return UserTS["columnsOrder"]
    } else {
      return undefined
    }
  }
}