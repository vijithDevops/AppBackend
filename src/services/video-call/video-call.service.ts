import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from 'agora-access-token';

@Injectable()
export class VideoCallService {
  constructor(private configService: ConfigService) {}

  // Build token with int uid
  async buildTokenWithUid(
    channelId: string,
    uid: number,
    role: number = RtcRole.PUBLISHER,
    expiry: number,
  ) {
    return await RtcTokenBuilder.buildTokenWithUid(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channelId,
      uid,
      role,
      expiry,
    );
  }

  // Build token with string uid
  async buildTokenWithAccount(
    channelId: string,
    account: string,
    role: number = RtcRole.PUBLISHER,
    expiry: number,
  ) {
    return await RtcTokenBuilder.buildTokenWithAccount(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channelId,
      account,
      role,
      expiry,
    );
  }

  async buildChatToken(
    uid: number | string,
    role: number = RtcRole.PUBLISHER,
    expiry: number,
  ) {
    return await RtmTokenBuilder.buildToken(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      uid,
      role,
      expiry,
    );
  }
}
