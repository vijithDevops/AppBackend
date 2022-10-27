import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/models/user/entity/user.entity';
import { UserModelService } from '../../../models/user/user.model.service';

@Injectable()
export class MessageService {
  constructor(private readonly userModelService: UserModelService) {}
  getDirectMessageGroupNames(senderId: string, receiverId: string) {
    return [`${senderId}-${receiverId}`, `${receiverId}-${senderId}`];
  }

  async validateNotificationReceiverIds(ids: string[]): Promise<boolean> {
    await this.userModelService.validateUserIds(ids).catch((err) => {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    });
    return true;
  }

  async getReceiverIdsFromChatId(chatIds: number[]): Promise<User['id'][]> {
    const userIds = await this.userModelService.getUserIdFromChatId(chatIds);
    return userIds.map((user) => {
      return user.id;
    });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} message`;
  // }
}
