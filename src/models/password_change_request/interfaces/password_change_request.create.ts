export class ICreatePasswordChangeRequest {
  userId: string;
  otp: number;
  otpGeneratedAt: Date;
  isOtpVerified: boolean;
  otpVerifiedAt?: Date;
  isExpired: boolean;
  generatedCount?: number;
}
