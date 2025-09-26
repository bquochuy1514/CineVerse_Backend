import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { hashPassword } from 'src/common/utils/password-hash.util';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async handleRegister(registerDto: RegisterDto) {
    // Check existed user
    const existedUser = await this.findUserByEmail(registerDto.email);
    if (existedUser) {
      throw new BadRequestException('Email is already registered!');
    }

    // Hash password
    const hashedPassword = await hashPassword(registerDto.password);
    const createdUser = this.usersRepository.create({
      ...registerDto,
      codeId: uuidv4(),
      codeExpiration: dayjs().add(5, 'minutes').toDate(),
      password: hashedPassword,
    });

    return this.usersRepository.save(createdUser);
  }
}
