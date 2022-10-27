import { OmitType } from '@nestjs/swagger';
import { CreateMessageGroupDto } from '../../../api/routes/message/dto/create-message.dto';

export class ICreateMessageGroup extends OmitType(CreateMessageGroupDto, [
  'users',
] as const) {}
