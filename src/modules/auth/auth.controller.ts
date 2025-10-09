import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @Post('login')
  // @UsePipes(ValidationPipe)
  // async login(@Body() loginDto: LoginDto) {
  //   const user = await this.authService.validateUser(loginDto);
  //   if (!user) {
  //     throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
  //   } else {
  //     if (user.isActive === false) {
  //       throw new BadRequestException(
  //         'Tài khoản chưa được kích hoạt! Vui lòng kích hoạt tài khoản',
  //       );
  //     }
  //   }
  //   return this.authService.login(user);
  // }

  // @Post('login')
  // @UseGuards(LocalAuthGuard)
  // login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  @Post('register')
  @UsePipes(ValidationPipe)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('status')
  // Dùng use guard này để bảo vệ route, đòi bearer token
  @UseGuards(JwtAuthGuard)
  status(@Request() req) {
    return req.user;
  }

  @Get('mail')
  testMail() {
    this.mailerService.sendMail({
      to: 'bquochuy260405@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'register.hbs', // HTML body content
      context: {
        name: 'Huy Đẹp Trai',
        activationCode: '12345626042005',
      },
    });
    return 'ok';
  }
}
