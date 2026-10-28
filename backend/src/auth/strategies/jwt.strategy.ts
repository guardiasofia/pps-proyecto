import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Algorithm } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

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

    const role =
      payload.rol ??
      payload.role ??
      (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles) ??
      null;

    return {
      ...payload,
      id: payload.sub ?? payload.id ?? payload.usuCodigo ?? null,
      email: payload.email ?? payload.mail ?? payload.correo ?? null,
      rol: role,
      username: payload.username ?? payload.userName ?? payload.usuario ?? null,
    };
  }
}
