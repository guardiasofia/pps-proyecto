import { Injectable, BadRequestException } from '@nestjs/common';
export interface NormalizedUser {
  id: string;
  email: string | null;
  rol: string | null;
  username: string | null;
}
@Injectable()
export class AuthService {
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
}