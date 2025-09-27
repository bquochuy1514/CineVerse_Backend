import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from 'src/common/utils/password-hash.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm người dùng có email này trong database
    const findUser = await this.usersService.findUserByEmail(email);

    // So sánh password người dùng nhập vào và password đã được hashed trong database
    const matchedPassword = comparePassword(password, findUser.password);
    if (findUser && matchedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, codeId, codeExpiration, ...user } = findUser;
      return user;
    }

    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister(registerDto: RegisterDto) {
    return this.usersService.handleRegister(registerDto);
  }
}
