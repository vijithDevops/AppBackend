import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
const bcrypt = require('bcrypt');
require('dotenv').config();

const MOCK_JWT_TOKEN = 'AJ7HJ7192JZXS';

const mockUserService = {
  findUserPasswordByUsername: jest.fn().mockReturnValue({
    id: 'AKJSSNSN8182020',
    password: 'password',
  }),
  findOne: jest.fn().mockReturnValue({
    id: 'AKJSSNSN8182020',
    username: 'admin',
    role: 'admin',
  }),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(MOCK_JWT_TOKEN),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('validate user login', () => {
    it('correct password should return a user object', async () => {
      bcrypt.compare = jest.fn(() => true);

      expect(await authService.validateUserLogin('admin', 'password')).toEqual({
        id: 'AKJSSNSN8182020',
        username: 'admin',
        role: 'admin',
      });

      expect(mockUserService.findUserPasswordByUsername).toBeCalledTimes(1);
      expect(mockUserService.findUserPasswordByUsername).toBeCalledWith(
        'admin',
      );
      expect(bcrypt.compare).toHaveBeenCalled;

      expect(mockUserService.findOne).toBeCalledTimes(1);
      expect(mockUserService.findOne).toBeCalledWith('AKJSSNSN8182020');
    });

    it('incorrect password should throw an error', async () => {
      bcrypt.compare = jest.fn(() => false);

      expect(
        async () =>
          await authService.validateUserLogin('admin', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', () => {
      expect(
        authService.login({
          id: 'AKJSSNSN8182020',
          username: 'admin',
          role: 'admin',
        }),
      ).resolves.toEqual({
        access_token: MOCK_JWT_TOKEN,
        userData: {
          id: 'AKJSSNSN8182020',
          username: 'admin',
          role: 'admin',
        },
      });
    });
  });
});
