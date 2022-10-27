import { IConnectyCubeUser } from './connecty_cube_user';

export class ICreateSignatureHashData {
  application_id: string;
  auth_key: string;
  nonce: number;
  timestamp: number;
  user?: IConnectyCubeUser;
}
