import { Algorithm } from 'jsonwebtoken';

export const ENV_PATH = 'env/respiree-backend/.env';
export const LOGGER_PATH = 'respiree-logs';

export const SMS_CLIENT = Symbol('AWS_SNS');
export const EMAIL_CLIENT = Symbol('AWS_SES');
export const FILE_UPLOAD_CLIENT = Symbol('AWS_S3');
export const PUSH_NOTIFICATION_CLIENT = Symbol('FIREBASE_ADMIN');
export const EVENT_SCHEDULER_SERVICE = Symbol('EVENT_SCHEDULER_SERVICE');

export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_ALGORITHM: Algorithm = 'HS512';
export const JWT_EXPIRES_IN = '1d';
export const REFRESH_JWT_EXPIRES_IN = '30d';
export const REFRESH_TOKEN_KEY = 'jwt_refresh';

export const MINIMUM_APPOINTMENT_TIME = 60000; // in milliseconds
export const APPOINTMENT_START_BEFORE_MINUTES = 5;
export const AGORA_PRESENTATION_MASK_USER_ID = 12345; // For AGORA video call presentaion, user is joined using a mask Id. In order to make User Id unique, append this constant to user Id.
export const AGORA_CHAT_MASK_USER_ID = 'chat'; // For AGORA RTM chat feature in video call, user is joined using a mask Id. In order to make User Id unique, append this constant to user Id.

export const CONNECTY_CUBE_DUMMY_PASSWORD = '123456789';
export const CONNECTY_CUBE_DUMMY_EMAIL = 'email@test.com';
export const CONNECTY_CUBE_HTTP_TIMEOUT = 20000; // Time in Milli seconds
export const CONNECTY_CUBE_HTTP_MAX_REDIRECTS = 5;

export const CONNECTY_CUBE_CREATE_SESSION_URL =
  'https://api.connectycube.com/session';
export const CONNECTY_CUBE_SESSION_EXPIRES_IN = 3600; //Time in seconds (1 Hrs)
export const CONNECTY_CUBE_SESSION_HASH = 'sha1';
export const CONNECTY_CUBE_CREATE_USER_URL =
  'https://api.connectycube.com/users';
export const CONNECTY_CUBE_USER_LOGIN_URL =
  'https://api.connectycube.com/login';

export const FORGOT_PASSWORD_OTP_EXPIRES_IN = 120 * 1000; //time in milliseconds
export const UPDATE_PASSWORD_AFTER_OTP_VERIFICATION_EXPIRES_IN = 300 * 1000; //time in milliseconds
export const FORGOT_PASSWORD_MESSAGE_BODY =
  'Use code {otp} to reset your password in Respiree';
export const PATIENT_APPOINTMENT_REMINDER_BODY =
  'Please join the video call through the App';

export const NOTIFICATION_REMINDER_BEFORE = 5;
export const S3_THUMBNAIL_FOLDER_NAME = 'thumbnails';
export const IMAGE_THUMBNAIL_WIDTH = 100;

export const PATIENT_DASHBOARD_LINK = '';
export const PATIENT_ACKNOWLEDGEMENT_LINK = '';

export const CRON_UPDATE_EXPIRED_APPOINTMENTS_BUFFER = 0; //in Minute
export const CRON_DELETE_EXPIRED_NOTIFICATIONS_AT = 24; //in HOURS

export const WEB_SOCKET_QUERY_AUTH_KEY = 'authorization'; //in Minute
export const GATEWAY_ONLINE_BEFORE = 6; //in Minute

export const MEDICAL_ALERT_DAILY_SCHEDULE_AT = 0; //in Hours, AT 00:00 HRS

export const MEDICAL_ENGINE_HOURLY_FILTER_DAYS_BEFORE = 30;
export const MEDICAL_ENGINE_DAILY_FILTER_MONTHS_BEFORE = 2;

export const MIN_POLLING_TIME = 60; // in seconds

export const SEND_PATIENT_CREDENTIALS_PATH = '/login_credential';

export const PASSWORD_BRUTE_lOCK_DAYS = 1; // in hours
export const LOGIN_FAILED_ATTEMPTS_TO_BLOCK = 5;

export const USER_UNLOCK_LINK = '/unlock-account';
export const USER_CHNAGE_PASSWORD_LINK = '/change-password';
export const USER_EMAIL_VERIFICATION_LINK = '/verify-account';
