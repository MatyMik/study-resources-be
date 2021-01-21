/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestValidationError } from './errors/request-validation-error';
import { HttpExceptionFilter } from './middlewares/error-filter';
import * as cookieParser from 'cookie-parser';
import { AuthGuard } from './middlewares/tokens';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ORIGIN,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalGuards(new AuthGuard());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new RequestValidationError(errors),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
