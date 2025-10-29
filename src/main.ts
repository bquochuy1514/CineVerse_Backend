import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true, //  Cho phép cookie gửi qua
  });

  app.setGlobalPrefix('api', { exclude: ['/'] });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, //  cho phép tự động chuyển đổi kiểu dữ liệu
      transformOptions: {
        enableImplicitConversion: true, //  tự động đổi "200" -> 200
      },
      exceptionFactory: (errors) => {
        const result = errors.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints),
        }));
        return new BadRequestException(result);
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  await app.listen(process.env.PORT);
}
bootstrap();
