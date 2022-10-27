import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageGroupDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageGroupDto) {}
