import { CustomError } from '../errors/custom-error';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (exception instanceof CustomError) {
      return response.status(status).send({
        statusCode: status,
        timestamp: new Date().toISOString(),
        errors: exception.serializeErrors(),
      });
    }
  }
}
