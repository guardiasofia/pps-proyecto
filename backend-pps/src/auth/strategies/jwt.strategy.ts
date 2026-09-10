import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Algorithm } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret =
      process.env.JWT_SECRET ?? process.env.JWT_PUBLIC_KEY ?? 'pps-secret-key';
    const algorithms = (process.env.JWT_ALGORITHM ?? 'HS256')
      .split(',')
      .map((value) => value.trim()) as Algorithm[];

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms,
    });
  }

  validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
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
