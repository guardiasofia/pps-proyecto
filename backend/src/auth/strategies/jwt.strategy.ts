import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Algorithm } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

const VALID_ROLES = ['RRHH', 'RRHH-ADMIN', 'ADMIN', 'EMPLEADO'];

export function resolveJwtOptions(environment = process.env) {
  const publicKey = environment.JWT_PUBLIC_KEY;
  const secretOrKey = (publicKey ?? environment.JWT_SECRET)?.replace(
    /\\n/g,
    '\n',
  );
  if (!secretOrKey) {
    throw new Error(
      'Configurá JWT_PUBLIC_KEY o JWT_SECRET del proveedor de identidad externo',
    );
  }
  const algorithms = (
    environment.JWT_ALGORITHM ?? (publicKey ? 'RS256' : 'HS256')
  )
    .split(',')
    .map((value) => value.trim()) as Algorithm[];

  return {
    secretOrKey,
    algorithms,
    jsonWebTokenOptions: { maxAge: environment.JWT_MAX_AGE ?? '1h' },
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      ...resolveJwtOptions(),
    });
  }

  validate(payload: any) {
    if (!payload || typeof payload.exp !== 'number') {
      throw new UnauthorizedException('El JWT debe incluir una expiración');
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new UnauthorizedException('El token ha expirado');
    }

    const id = payload.sub ?? payload.id ?? payload.usuCodigo;
    if (id === undefined || id === null || id === '') {
      throw new UnauthorizedException('El JWT debe incluir el identificador del usuario');
    }

    const rawRole =
      payload.rol ??
      payload.role ??
      (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles) ??
      null;
    if (
      rawRole !== null &&
      typeof rawRole !== 'string' &&
      typeof rawRole !== 'number'
    ) {
      throw new UnauthorizedException('El claim de rol debe ser texto o número');
    }

    // Los ids de la tabla `roles` (1 = rrhh, 2 = empleado) se normalizan.
    const normalized = rawRole === null ? null : String(rawRole).trim().toUpperCase();
    const role =
      normalized === '1' ? 'RRHH' : normalized === '2' ? 'EMPLEADO' : normalized;
    if (role && !VALID_ROLES.includes(role)) {
      throw new UnauthorizedException(`Rol no válido: ${rawRole}`);
    }

    return {
      id,
      rol: role,
      email: payload.email ?? payload.mail ?? payload.correo ?? null,
      username: payload.username ?? payload.userName ?? payload.usuario ?? null,
    };
  }
}
