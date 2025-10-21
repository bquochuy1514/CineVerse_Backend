import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private formatAvatarUrl(avatarPath: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    if (!avatarPath) {
      return `${baseUrl}/images/users/default_avatar.jpg`;
    }
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    return `${baseUrl}${avatarPath}`;
  }

  findUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async handleGetUserProfile(payload: any) {
    const user = await this.findUserByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {
      password,
      codeId,
      codeExpiration,
      codeOTP,
      codeOTPExpiration,
      isOtpVerified,
      hashedRefreshToken,
      ...formatedUser
    } = user;

    formatedUser.avatar = this.formatAvatarUrl(formatedUser.avatar);
    return formatedUser;
  }
}
