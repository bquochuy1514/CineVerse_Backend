import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    if (!findUser) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // So sánh password người dùng nhập vào và password đã được hashed trong database
    const matchedPassword = await comparePassword(password, findUser.password);

    if (!matchedPassword) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (findUser && matchedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, codeId, codeExpiration, ...user } = findUser;
      return user;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    // Ở đây user chắc chắn sẽ được trả, các throw exception đã được xử lí ở validateUser
    const user = await this.validateUser(loginDto);

    if (!user.isActive) {
      throw new BadRequestException(
        'Tài khoản chưa được kích hoạt! Vui lòng kích hoạt tài khoản',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister(registerDto: RegisterDto) {
    return this.usersService.handleRegister(registerDto);
  }

  // async login(user: any) {
  //   const payload = { sub: user.id, email: user.email, role: user.role };

  //   return {
  //     user,
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }
}
