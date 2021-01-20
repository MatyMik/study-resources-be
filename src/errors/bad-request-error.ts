import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  constructor(public message: string) {
    super(message, 400);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
