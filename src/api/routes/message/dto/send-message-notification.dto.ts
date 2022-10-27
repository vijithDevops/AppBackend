import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
// import { MessageGroupType } from 'src/models/message/entity/message.enum';

export class SendMessageNotificationDto {
  @ApiProperty({
    type: Number,
    isArray: true,
    required: true,
    description: 'Connecty cube chat Id of all notification receivers',
  })
  @IsNotEmpty()
  receiversChatId: number[];

  @ApiProperty()
  @IsOptional()
  payload: any = {};
}
