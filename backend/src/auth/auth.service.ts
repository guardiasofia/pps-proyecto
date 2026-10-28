import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getProfile(user: any) {
    const role =
      user?.rol ??
      user?.role ??
      (Array.isArray(user?.roles) ? user.roles[0] : user?.roles) ??
      null;

    return {
      ...user,
      id: user?.sub ?? user?.id ?? user?.usuCodigo ?? null,
      email: user?.email ?? user?.mail ?? user?.correo ?? null,
      rol: role,
      username: user?.username ?? user?.userName ?? user?.usuario ?? null,
    };
  }
}
