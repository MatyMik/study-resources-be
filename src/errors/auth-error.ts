import { CustomError } from './custom-error';

export class AuthError extends CustomError {
  statusCode = 401;

  constructor(public field: string, public message: string) {
    super(message, 401);
    this.field = field;
    this.message = message;
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, field: this.field }];
  }
}
