import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { verify, decode } from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors/not-authorized-error';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (/auth\//.test(request.url) && request.url !== '/auth/verifytoken')
      return true;
    const token = request.headers.authorization.split('=')[1];
    try {
      const user = verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (typeof user === 'string') return null;
      request.user = user;
      return true;
    } catch (e) {
      throw new NotAuthorizedError('Jwt token not valid');
    }
  }
}
