import { HttpException } from '@nestjs/common';

export abstract class CustomError extends HttpException {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: any; field?: string }[];
}
