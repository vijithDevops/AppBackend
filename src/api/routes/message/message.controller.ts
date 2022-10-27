import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  CreateMessageGroupDto,
  ChatUsersListPaginated,
  SendMessageNotificationDto,
  ChatDialogueSecretsDto,
} from './dto';
import { Role } from 'src/models/user/entity/user.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ChatService } from '../../../services/chat/chat.service';
import { getPagination } from 'src/common/utils/entity_metadata';
import { MessageModelService } from '../../../models/message/message.model.service';
import { MessageGroupType } from 'src/models/message/entity/message.enum';
import { UserModelService } from '../../../models/user/user.model.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { LogService } from 'src/services/logger/logger.service';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { getUniqueArrayStringValues } from 'src/common/utils/helpers';
import { AES } from 'crypto-js';
import { ConfigService } from '@nestjs/config';
const cryptoRandomString = require('crypto-random-string');

@Controller('message')
@ApiBearerAuth()
@ApiTags('Message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageModelService: MessageModelService,
    private readonly userModelService: UserModelService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
    private logService: LogService,
    private configService: ConfigService,
  ) {
    this.logService.setContext('MessageController');
  }

  @UseGuards(JwtAuthGuard)
  @Post('/message-group')
  async createMessageGroup(
    @Request() req,
    @Body() createMessageGroupDto: CreateMessageGroupDto,
  ) {
    const userId = req.user.id;
    if (req.user.role !== Role.ADMIN) {
      await this.userModelService
        .validateOrganizationOfUsers(
          createMessageGroupDto.users,
          req.user.organizationId,
        )
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
    }
    let newGroupCreated = true;
    let groupId;
    let messageGroupName = createMessageGroupDto.name;
    if (createMessageGroupDto.type === MessageGroupType.DIRECT) {
      const directMsgGroupNames = this.messageService.getDirectMessageGroupNames(
        userId,
        createMessageGroupDto.users[0],
      );
      const groupData = await this.messageModelService.getDirectGroupDataFromName(
        directMsgGroupNames,
      );
      if (groupData) {
        newGroupCreated = false;
        groupId = groupData.id;
      } else {
        messageGroupName = `${userId}-${createMessageGroupDto.users[0]}`;
      }
    }
    if (newGroupCreated) {
      // create msg group
      const newGroupData = await this.messageModelService.createMessageGroup({
        name: messageGroupName,
        type: createMessageGroupDto.type,
      });
      groupId = newGroupData.id;
      // creat messag group users
      const groupUsers = createMessageGroupDto.users.map((id) => {
        return {
          userId: id,
          messageGroupId: groupId,
        };
      });
      groupUsers.push({
        userId,
        messageGroupId: groupId,
      });
      await this.messageModelService
        .createMessageGroupUsers(groupUsers)
        .catch((err) => {
          this.logService.error('Error creating messag group users', err);
          throw new HttpException(
            'Failed to create message group',
            HttpStatus.BAD_REQUEST,
          );
        });
    }
    return {
      newGroupCreated,
      groupData: await this.messageModelService.findOneGroupDetails(groupId),
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get('/users-list')
  async messageUsersList(
    @Request() req,
    @Query() queryParams: ChatUsersListPaginated,
  ) {
    const user = req.user;
    const { search, organizationId, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    if (user.role === Role.PATIENT) {
      return await this.userModelService.getPatientSupervisors(user.id, {
        limit,
        skip,
        search,
        organizationId,
      });
    } else if (user.role === Role.ADMIN) {
      return await this.userModelService.getAdminChatUsers(user.id, {
        limit,
        skip,
        search,
        organizationId,
      });
    } else {
      return await this.userModelService.getSupervisorChatUsers(user.id, {
        limit,
        skip,
        search,
        organizationId,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/verify-user')
  verifyUserForChatLogin(@Request() req) {
    const user = req.user;
    this.logService.logInfo(`Success verifying connectyCube auth: ${user.id}`);
    return {
      user: {
        id: user.id,
        login: user.username,
        full_name: user.firstName
          ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${
              user.lastName
            }`
          : null,
        user_tags: user.role,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/token')
  async getSessionToken() {
    const session = await this.chatService.createSession().catch((err) => {
      throw new HttpException(err.message, HttpStatus.FAILED_DEPENDENCY);
    });
    return session.data;
  }

  @ApiBody({
    type: SendMessageNotificationDto,
    description: 'Send notification for new message',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/notification')
  async sendMessageNotification(
    @Request() req,
    @Body() sendNotificationDto: SendMessageNotificationDto,
  ) {
    try {
      const receiverIds = await this.messageService.getReceiverIdsFromChatId(
        sendNotificationDto.receiversChatId,
      );
      if (receiverIds && receiverIds.length > 0) {
        const notificationMessage = await this.notificationService.createNotificationMessage(
          {
            ...NOTIFICATION_EVENTS.NEW_DIRECT_CHAT_MESSAGE,
            notificationType: NotificationType.PUSH,
          },
          {
            NAME: req.user.firstName,
          },
        );
        //send notification
        this.notificationService.generateNotification(
          {
            ...notificationMessage,
            actorId: req.user.id,
            payload: {
              ...(sendNotificationDto.payload
                ? sendNotificationDto.payload
                : {}),
            },
          },
          receiverIds,
          NOTIFICATION_EVENTS.NEW_DIRECT_CHAT_MESSAGE,
          true,
          false,
        );
        return {
          status: 200,
          message: 'Successfully send notification to users',
        };
      } else {
        throw new HttpException('Invalid receivers', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({
    type: ChatDialogueSecretsDto,
    description: 'Get all chat dialogues secrets of user',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/dialogue/secrets')
  async getChatDialoguesSecrets(@Body() dto: ChatDialogueSecretsDto) {
    try {
      const uniqueChatId = getUniqueArrayStringValues(dto.chatIds);
      const secrets = await this.messageModelService.getMessageGroupSecretsByChatIds(
        uniqueChatId,
      );
      const chatSecretObject = {};
      secrets.forEach((secret) => {
        chatSecretObject[`${secret.chatId}`] = secret;
      });
      const createChatSecrets = [];
      const encryptionSecret = this.configService.get('JWT_SECRET');
      uniqueChatId.forEach((chatId) => {
        if (!chatSecretObject[chatId]) {
          // Generate randon secret and salt and store it in
          const chatSecrets = {
            chatId,
            salt: AES.encrypt(
              cryptoRandomString({ length: 32 }),
              encryptionSecret,
            ).toString(),
            secret: AES.encrypt(
              cryptoRandomString({ length: 32 }),
              encryptionSecret,
            ).toString(),
          };
          createChatSecrets.push(chatSecrets);
          chatSecretObject[`${chatId}`] = chatSecrets;
        }
      });
      if (createChatSecrets.length > 0) {
        await this.messageModelService.createMessageGroupSecrets(
          createChatSecrets,
        );
      }
      return chatSecretObject;
    } catch (error) {
      throw error;
    }
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
  //   return this.messageService.update(+id, updateMessageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.messageService.remove(+id);
  // }
}
