import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // Ưu tiên lấy token từ header
          let token = null;
          if (req.headers.authorization?.startsWith('Bearer ')) {
            console.log('Found refresh token in header ✅');
            token = req.headers.authorization.split(' ')[1];
            console.log('token in header = ', token);
          }
          // Nếu không có header thì thử lấy từ cookie
          if (!token && req.cookies?.refresh_token) {
            console.log('Found refresh token in cookie ✅');
            token = req.cookies.refresh_token;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfiguration.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken =
      req.headers.authorization?.replace('Bearer', '').trim() ||
      req.cookies?.refresh_token;
    console.log(refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.authService.validateRefreshToken(payload, refreshToken);
  }
}
