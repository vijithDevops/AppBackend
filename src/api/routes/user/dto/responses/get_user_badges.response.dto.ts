import { ApiProperty } from '@nestjs/swagger';

export class UserBadgesResponseDto {
  @ApiProperty()
  notification: number;
}
