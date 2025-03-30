import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

export function IsAdmin() {
  return applyDecorators(UseGuards(AdminGuard));
}
