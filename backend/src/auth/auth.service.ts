import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from './password.js';

interface LoginAccount {
  usucodigo: number;
  username: string | null;
  email: string | null;
  idrol: number | null;
  descripcion: string | null;
  password_hash: string | null;
}

export interface AuthDataSource {
  query(query: string, parameters?: unknown[]): Promise<unknown>;
}

const VALID_ROLES = ['1', '2', 'RRHH', 'RRHH-ADMIN', 'ADMIN', 'EMPLEADO'];

function isLoginAccount(value: unknown): value is LoginAccount {
  if (!value || typeof value !== 'object') return false;
  const account = value as Record<string, unknown>;
  return (
    typeof account.usucodigo === 'number' &&
    (typeof account.username === 'string' || account.username === null) &&
    (typeof account.email === 'string' || account.email === null) &&
    (typeof account.idrol === 'number' || account.idrol === null) &&
    (typeof account.descripcion === 'string' || account.descripcion === null) &&
    (typeof account.password_hash === 'string' ||
      account.password_hash === null)
  );
}

function jwtExpirySeconds(value: string): number {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d|w|y)?$/i.exec(value);
  if (!match) {
    throw new Error('JWT_MAX_AGE debe ser una duración, por ejemplo 1h');
  }

  const amount = Number(match[1]);
  const secondsPerUnit: Record<string, number> = {
    ms: 0.001,
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    y: 31536000,
  };
  const seconds = amount * secondsPerUnit[(match[2] ?? 's').toLowerCase()];
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error('JWT_MAX_AGE debe ser mayor que cero');
  }
  return Math.ceil(seconds);
}

export function resolveLocalJwtSigningOptions(environment = process.env) {
  const publicKey = environment.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
  const privateKey = environment.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const allowedAlgorithms = (
    environment.JWT_ALGORITHM ?? (publicKey ? 'RS256' : 'HS256')
  )
    .split(',')
    .map((value) => value.trim());

  if (publicKey || privateKey) {
    if (!publicKey || !privateKey) {
      throw new Error(
        'Para emitir JWT RS256 configurá JWT_PUBLIC_KEY y JWT_PRIVATE_KEY',
      );
    }
    if (!allowedAlgorithms.includes('RS256')) {
      throw new Error('JWT_ALGORITHM debe permitir RS256 para emitir el login');
    }
    return {
      secretOrPrivateKey: privateKey,
      algorithm: 'RS256' as const,
      expiresIn: jwtExpirySeconds(environment.JWT_MAX_AGE ?? '1h'),
    };
  }

  const secret = environment.JWT_SECRET;
  if (!secret) {
    throw new Error('Configurá JWT_SECRET para habilitar el login con CUIL');
  }
  if (!allowedAlgorithms.includes('HS256')) {
    throw new Error('JWT_ALGORITHM debe permitir HS256 para emitir el login');
  }
  return {
    secretOrPrivateKey: secret,
    algorithm: 'HS256' as const,
    expiresIn: jwtExpirySeconds(environment.JWT_MAX_AGE ?? '1h'),
  };
}

export interface NormalizedUser {
  id: string;
  email: string | null;
  rol: string | null;
  username: string | null;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: AuthDataSource,
  ) {}

  getProfile(user: any): NormalizedUser {
    if (!user || typeof user !== 'object') {
      throw new BadRequestException('Usuario inválido');
    }
    // Validar ID (claim 'sub' es estándar en JWT)
    const id = user.sub ?? user.id ?? user.usuCodigo;
    if (!id) {
      throw new BadRequestException('El usuario debe tener un identificador');
    }
    //  Validar y normalizar rol
    const role =
      user.rol ??
      user.role ??
      (Array.isArray(user.roles) ? user.roles[0] : user.roles) ??
      null;
    if (role !== null && typeof role !== 'string' && typeof role !== 'number') {
      throw new BadRequestException('El rol debe ser texto o número');
    }
    //  Validar email
    const email = user.email ?? user.mail ?? user.correo ?? null;
    if (email && typeof email !== 'string') {
      throw new BadRequestException('El email debe ser string');
    }
    //  Validar username
    const username = user.username ?? user.userName ?? user.usuario ?? null;
    if (username && typeof username !== 'string') {
      throw new BadRequestException('El username debe ser string');
    }
    //  Retornar SOLO campos validados
    return {
      id: String(id),
      email: email ? String(email).toLowerCase() : null,
      rol: role ? String(role).toUpperCase() : null,
      username: username ? String(username) : null,
    };
  }

  async login(cuil: string, password: string) {
    const enteredCuil = cuil.trim();
    const normalizedCuil = enteredCuil.replace(/\D/g, '');
    if (
      !/^[0-9\s.-]+$/.test(enteredCuil) ||
      !/^\d{11}$/.test(normalizedCuil) ||
      !password
    ) {
      throw new UnauthorizedException('CUIL o contraseña incorrectos');
    }

    const result = await this.dataSource.query(
      `SELECT u.usucodigo,
              COALESCE(NULLIF(BTRIM(CONCAT_WS(
                         ' ',
                         NULLIF(BTRIM(u.usunombre), ''),
                         NULLIF(BTRIM(u.apenom), '')
                       )), ''),
                       NULLIF(BTRIM(CONCAT_WS(' ', e.nombres, e.apellido)), ''),
                       e.cuil) AS username,
              u.email,
              u.idrol,
              r.descripcion,
              u.password_hash
       FROM public.empleados e
       JOIN public.usuarioslegajos ul
         ON ul.legajo = e.legajo AND ul.estado = 'AC'
       JOIN public.usuarios u
         ON u.usucodigo = ul.usucodigo AND u.estado = 'AC'
       LEFT JOIN public.roles r ON r.idrol = u.idrol
       WHERE e.estado = 'AC'
         AND regexp_replace(e.cuil, '[^0-9]', '', 'g') = $1`,
      [normalizedCuil],
    );
    const accounts = Array.isArray(result) ? result.filter(isLoginAccount) : [];

    const account = accounts[0];
    if (accounts.length !== 1 || !account?.password_hash) {
      await hashPassword(password);
      throw new UnauthorizedException('CUIL o contraseña incorrectos');
    }

    if (!(await verifyPassword(password, account.password_hash))) {
      throw new UnauthorizedException('CUIL o contraseña incorrectos');
    }

    const profile = this.getProfile({
      sub: account.usucodigo,
      rol: account.idrol ?? account.descripcion,
      email: account.email,
      username: account.username,
    });
    if (!profile.rol || !VALID_ROLES.includes(profile.rol)) {
      throw new UnauthorizedException('CUIL o contraseña incorrectos');
    }

    const signingOptions = resolveLocalJwtSigningOptions();
    const accessToken = jwt.sign(
      {
        rol: profile.rol,
        email: profile.email,
        username: profile.username,
        iss: 'pps-local',
      },
      signingOptions.secretOrPrivateKey,
      {
        algorithm: signingOptions.algorithm,
        expiresIn: signingOptions.expiresIn,
        subject: profile.id,
      },
    );

    return { access_token: accessToken, user: profile };
  }
}
