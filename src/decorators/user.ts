import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((user: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return user ? request.user : null;
});
