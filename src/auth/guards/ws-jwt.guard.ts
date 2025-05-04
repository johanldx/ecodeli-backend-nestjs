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

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token;
    if (!token) throw new UnauthorizedException('Token manquant');
    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload; // on stocke userId etc.
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
