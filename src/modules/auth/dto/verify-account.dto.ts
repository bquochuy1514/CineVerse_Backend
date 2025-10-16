import { IsNotEmpty } from 'class-validator';

// src/auth/dto/verify-account.dto.ts
export class VerifyAccountDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  codeId: string;
}
