import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  constructor(public message: string = 'Route not found') {
    super(message, 404);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
