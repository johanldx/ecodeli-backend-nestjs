import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient<Socket>();
    const token = (client.handshake.auth as any)?.token;
    console.log('[WsJwtAuthGuard] token reçu sur WS:', token);
    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log('[WsJwtAuthGuard] payload décodé:', payload);
      return true;
    } catch (err) {
      console.error('[WsJwtAuthGuard] JWT invalide', err);
      return false;
    }
  }
}
