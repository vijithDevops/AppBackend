import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageGroup } from './entity/message_group.entity';
import { MessageGroupSecret } from './entity/message_group_secret.entity';
import { MessageGroupUsers } from './entity/message_group_users.entity';
import {
  ICreateMessageGroup,
  ICreateMessageGroupSecret,
  ICreateMessageGroupUser,
} from './interfaces';

@Injectable()
export class MessageModelService {
  constructor(
    @InjectRepository(MessageGroup)
    private messageGroupRepository: Repository<MessageGroup>,
    @InjectRepository(MessageGroupUsers)
    private messageGroupUserRepository: Repository<MessageGroupUsers>,
    @InjectRepository(MessageGroupSecret)
    private messageGroupSecretRepository: Repository<MessageGroupSecret>,
  ) {}

  createMessageGroup(
    createMessageGroup: ICreateMessageGroup,
  ): Promise<MessageGroup> {
    return this.messageGroupRepository.save(createMessageGroup);
  }

  async createMessageGroupUsers(
    createMessageGroupUsers: ICreateMessageGroupUser[],
  ) {
    return await this.messageGroupUserRepository.save(createMessageGroupUsers);
  }

  async createMessageGroupSecrets(
    createMessageGroupSecrets: ICreateMessageGroupSecret[],
  ): Promise<MessageGroupSecret[]> {
    return await this.messageGroupSecretRepository
      .save(createMessageGroupSecrets)
      .catch((err) => {
        throw err;
      });
  }

  getDirectGroupDataFromName(name: string[]) {
    return this.messageGroupRepository
      .createQueryBuilder('messageGroup')
      .where('messageGroup.name IN (:name)', { name })
      .getOne();
  }

  getMessageGroupSecretsByChatIds(chatIds: string[]) {
    return this.messageGroupSecretRepository
      .createQueryBuilder('messageGroupSecrets')
      .where('messageGroupSecrets.chatId IN (:...chatIds)', { chatIds })
      .getMany();
  }

  async findOneGroupDetails(id: number) {
    return await this.messageGroupRepository
      .createQueryBuilder('messageGroup')
      .where('messageGroup.id = :id', { id })
      .select([
        'messageGroup.id',
        'messageGroup.name',
        'messageGroup.type',
        'messageGroup.createdAt',
      ])
      .leftJoin('messageGroup.users', 'groupUsers')
      .leftJoin('groupUsers.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.email',
      ])
      .getOne();
  }
}
