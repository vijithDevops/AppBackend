import { ConfigService } from '@nestjs/config';
import * as Admin from 'firebase-admin';

import { PUSH_NOTIFICATION_CLIENT } from '../../constants';

export const FirebaseConnection = {
  provide: PUSH_NOTIFICATION_CLIENT,
  useFactory: async (configService: ConfigService) => {
    Admin.initializeApp({
      credential: Admin.credential.cert(
        JSON.parse(configService.get('FIREBASE_ACCOUNT_KEY')),
      ),
    });
    return Admin;
  },
  inject: [ConfigService],
};
