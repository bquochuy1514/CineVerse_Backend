import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserGender, UserRole } from '../enums/user.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', default: '/images/users/default_avatar.jpg' })
  avatar: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender: UserGender;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  // Luồng xác thực tài khoản
  @Column({ name: 'code_id', type: 'varchar', nullable: true })
  codeId: string;

  @Column({ name: 'code_expiration', type: 'timestamp', nullable: true })
  codeExpiration: Date;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  // Luồng xác thực OTP của quên mật khẩu
  @Column({ name: 'code_otp', type: 'varchar', length: 6, nullable: true })
  codeOTP: string;

  @Column({ name: 'code_otp_expiration', type: 'timestamp', nullable: true })
  codeOTPExpiration: Date;

  @Column({ name: 'is_otp_verified', type: 'boolean', default: false })
  isOtpVerified: boolean;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  // socialAccounts: SocialAccount[];
}
