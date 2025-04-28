import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as Request & {
      user?: any;
    };

    if (!request.user) {
      throw new UnauthorizedException(
        'Vous devez être connecté pour accéder à cette ressource',
      );
    }

    return true;
  }
}
