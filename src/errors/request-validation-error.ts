import { ValidationError } from 'class-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super('Validation failed', 400);

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      const message = Object.keys(err.constraints).map(
        (key) => err.constraints[key],
      );
      return { message, field: err.property };
    });
  }
}
