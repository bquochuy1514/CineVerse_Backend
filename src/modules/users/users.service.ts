import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { hashPassword } from 'src/common/utils/password-hash.util';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  findUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async handleRegister(registerDto: RegisterDto) {
    // Check existed user
    const existedUser = await this.findUserByEmail(registerDto.email);
    if (existedUser) {
      throw new BadRequestException(
        'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc chọn email khác.',
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(registerDto.password);
    const createdUser = this.usersRepository.create({
      ...registerDto,
      codeId: uuidv4(),
      codeExpiration: dayjs().add(5, 'minutes').toDate(),
      password: hashedPassword,
    });

    // Sending email
    this.mailerService.sendMail({
      to: createdUser.email, // list of receivers
      subject: 'Kích hoạt tài khoản CineVerse', // Subject line
      template: 'register.hbs', // HTML body content
      context: {
        name: createdUser.fullName,
        activationCode: createdUser.codeId,
      },
    });

    await this.usersRepository.save(createdUser);

    return {
      message:
        'Đăng kí thành công! Vui lòng kiểm tra email để kích hoạt tài khoản',
      user: {
        id: createdUser.id,
        email: createdUser.email,
      },
    };
  }
}
