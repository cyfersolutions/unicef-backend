import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentVaccinator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.vaccinator; // Assuming vaccinator is attached to request by auth guard
  },
);

