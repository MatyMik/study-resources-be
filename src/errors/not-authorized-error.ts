import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  constructor(public message: string = 'Not Authorized') {
    super(message, 401);

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
