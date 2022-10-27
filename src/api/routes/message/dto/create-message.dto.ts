import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { MessageGroupType } from 'src/models/message/entity/message.enum';

export class CreateMessageGroupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ enum: [...Object.values(MessageGroupType)], required: true })
  @IsNotEmpty()
  type: MessageGroupType;

  @ApiProperty({ type: Array, required: true })
  @IsNotEmpty()
  users: string[];
}
