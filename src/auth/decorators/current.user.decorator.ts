import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: unknown, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    return req.user;
  },
);
