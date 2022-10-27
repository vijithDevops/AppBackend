import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/common/http/http.service';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import {
  CONNECTY_CUBE_CREATE_SESSION_URL,
  CONNECTY_CUBE_CREATE_USER_URL,
  CONNECTY_CUBE_SESSION_EXPIRES_IN,
  CONNECTY_CUBE_SESSION_HASH,
  CONNECTY_CUBE_USER_LOGIN_URL,
} from '../../config/constants';
import {
  ICreateSignatureHashData,
  ICreateCBUser,
  IConnectyCubeUser,
  ILoginUserUsingCIdP,
} from './interfaces';
import { randomNumber, unixTime } from '../../common/utils/helpers';
import { CONNECTY_CUBE_DUMMY_PASSWORD } from '../../config/constants';

@Injectable()
export class ChatService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async createSession(): Promise<AxiosResponse> {
    const postBody = {
      application_id: this.configService.get('CONNECTY_CUBE_APP_ID'),
      auth_key: this.configService.get('CONNECTY_CUBE_AUTHORIZATION_KEY'),
      nonce: randomNumber(),
      timestamp: unixTime() + CONNECTY_CUBE_SESSION_EXPIRES_IN,
    };
    postBody['signature'] = this.createSessionSignature(postBody);
    const postHeaders = {
      'Content-Type': 'application/json',
    };
    return await this.httpService
      .post(CONNECTY_CUBE_CREATE_SESSION_URL, postBody, {
        headers: postHeaders,
      })
      .toPromise()
      .catch((err) => {
        Logger.error('Error creating ConnectyCube session Token', err);
        throw new Error('Failed to create ConnectyCube Session');
      });
  }

  async createUserSession(user: IConnectyCubeUser): Promise<AxiosResponse> {
    const postBody = {
      application_id: this.configService.get('CONNECTY_CUBE_APP_ID'),
      auth_key: this.configService.get('CONNECTY_CUBE_AUTHORIZATION_KEY'),
      nonce: randomNumber(),
      timestamp: unixTime() + CONNECTY_CUBE_SESSION_EXPIRES_IN,
      user,
    };
    postBody['signature'] = this.createSessionSignature(postBody);
    const postHeaders = {
      'Content-Type': 'application/json',
    };
    return await this.httpService
      .post(CONNECTY_CUBE_CREATE_SESSION_URL, postBody, {
        headers: postHeaders,
      })
      .toPromise()
      .catch((err) => {
        Logger.error('Error creating ConnectyCube session Token', err);
        throw new Error('Failed to create ConnectyCube Session');
      });
  }

  // createSessionSignature(params: ICreateSignatureHashData): string {
  //   const text = `application_id=${params.application_id}&auth_key=${params.auth_key}&nonce=${params.nonce}&timestamp=${params.timestamp}`;
  //   return crypto
  //     .createHmac(
  //       'sha1',
  //       this.configService.get('CONNECTY_CUBE_AUTHORIZATION_SECRET'),
  //     )
  //     .update(text)
  //     .digest('hex');
  // }

  createSessionSignature(params: ICreateSignatureHashData): string {
    const sessionMsg = Object.keys(params)
      .map(function (val) {
        if (typeof params[val] === 'object') {
          return Object.keys(params[val])
            .map(function (val1) {
              return val + '[' + val1 + ']=' + params[val][val1];
            })
            .sort()
            .join('&');
        } else {
          return val + '=' + params[val];
        }
      })
      .sort()
      .join('&');
    return crypto
      .createHmac(
        CONNECTY_CUBE_SESSION_HASH,
        this.configService.get('CONNECTY_CUBE_AUTHORIZATION_SECRET'),
      )
      .update(sessionMsg)
      .digest('hex');
  }

  async createUser(userData: ICreateCBUser): Promise<AxiosResponse> {
    const session = await this.createSession(); // TODO:Store already created CB-token and use here
    const userPostBody = {
      user: {
        login: userData.login,
        password: userData.password,
        full_name: userData.fullName ? userData.fullName : null,
        tag_list: userData.role,
      },
    };
    const postHeaders = {
      'Content-Type': 'application/json',
      'CB-Token': session.data.session.token,
    };
    return await this.httpService
      .post(CONNECTY_CUBE_CREATE_USER_URL, userPostBody, {
        headers: postHeaders,
      })
      .toPromise()
      .catch((err) => {
        Logger.error('Error creating ConnectyCube user', err);
        throw new Error('Failed to create ConnectyCube user');
      });
  }

  async loginUserUsingCIdP(
    loginData: ILoginUserUsingCIdP,
  ): Promise<AxiosResponse> {
    const session = await this.createSession(); // TODO:Store already created CB-token and use here
    const loginUserPostBody = {
      login: `Bearer ${loginData.token}`,
      password: CONNECTY_CUBE_DUMMY_PASSWORD,
    };
    const postHeaders = {
      'Content-Type': 'application/json',
      'CB-Token': session.data.session.token,
    };
    return await this.httpService
      .post(CONNECTY_CUBE_USER_LOGIN_URL, loginUserPostBody, {
        headers: postHeaders,
      })
      .toPromise()
      .catch((err) => {
        Logger.error('Error in ConnectyCube login user using CIdP ', err);
        throw new Error('Failed to login ConnectyCube user using CIdP');
      });
  }
}
