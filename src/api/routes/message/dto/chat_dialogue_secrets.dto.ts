import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChatDialogueSecretsDto {
  @ApiProperty({ type: Array, required: true })
  @IsNotEmpty()
  chatIds: string[];
}
