import { CustomError } from './custom-error';

export class ResourceExistsError extends CustomError {
  constructor(public message: string) {
    super(message, 409);

    Object.setPrototypeOf(this, ResourceExistsError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
