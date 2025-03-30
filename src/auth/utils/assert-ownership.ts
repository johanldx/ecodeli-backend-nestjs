import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/users/user.entity';

export function assertUserOwnsResourceOrIsAdmin(
  user: User,
  resourceOwnerId: number,
  errorMessage = 'You are not authorized to access this resource',
): void {
  const isOwner = user.id === resourceOwnerId;
  const isAdmin = user.administrator === true;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenException(errorMessage);
  }
}
