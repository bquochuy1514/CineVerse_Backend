import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginDto } from './dto/login.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto) {
    return this.authService.handleLogin(loginDto);
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.handleRegister(registerDto);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  refreshToken(@Req() req) {
    return this.authService.handleRefreshToken(req.user);
  }

  @Post('verify-account')
  @UsePipes(ValidationPipe)
  verifyAccount(@Body() verifyAccountDto: VerifyAccountDto) {
    return this.authService.handleVerifyAccount(verifyAccountDto);
  }

  @Post('resend-code')
  resendCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.handleResendCode(resendCodeDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.handleForgotPassword(forgotPasswordDto);
  }

  @Post('resend-otp')
  resendOTP(@Body('email') email: string) {
    return this.authService.handleResendOTP(email);
  }

  @Post('verify-otp')
  verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.handleVerifyOTP(verifyOtpDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.handleResetPassword(resetPasswordDto);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.loginWithGoogle(req.user);
    res.redirect(`http://localhost:3000?token=${response.access_token}`);
  }

  // @Post('login')
  // @UsePipes(ValidationPipe)
  // @UseGuards(LocalAuthGuard)
  // login(@Request() req) {
  //   return this.authService.handleLogin(req.user);
  // }

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
