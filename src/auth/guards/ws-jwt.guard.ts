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
    // 1) Récupère le socket
    const client = ctx.switchToWs().getClient<Socket>();
    // 2) Récupère le token transmis via handshake.auth
    const token = (client.handshake.auth as any)?.token;
    console.log('[WsJwtAuthGuard] token reçu sur WS:', token);
    if (!token) return false;

    try {
      // 3) Vérifie et décode
      const payload = this.jwtService.verify(token);
      // 4) Stocke le payload dans client.data pour l’utiliser dans les handlers
      client.data.user = payload;
      console.log('[WsJwtAuthGuard] payload décodé:', payload);
      return true;
    } catch (err) {
      console.error('[WsJwtAuthGuard] JWT invalide', err);
      return false;
    }
  }
}
