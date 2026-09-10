import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req?.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const algorithms = (process.env.JWT_ALGORITHM ?? 'HS256')
      .split(',')
      .map((value) => value.trim()) as jwt.Algorithm[];

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET ?? process.env.JWT_PUBLIC_KEY ?? 'pps-secret-key',
        {
          algorithms,
        },
      ) as jwt.JwtPayload;

      req.user = {
        ...payload,
        id: payload.sub ?? payload.id ?? payload.usuCodigo ?? null,
        email: payload.email ?? payload.mail ?? payload.correo ?? null,
        rol: payload.rol ?? payload.role ?? payload.roles ?? null,
        username: payload.username ?? payload.userName ?? payload.usuario ?? null,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
