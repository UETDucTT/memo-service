import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserTokenPayload } from 'src/identity/identity.model';

export const AuthMeta = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserTokenPayload => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
