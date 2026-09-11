import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto.js';
import { Usuario } from './entities/usuario.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('usuario.email = :email', { email: loginDto.email })
      .andWhere('usuario.password_hash = crypt(:password, usuario.password_hash)', {
        password: loginDto.password,
      })
      .getOne();

    if (!usuario || usuario.estado !== 'AC' || !usuario.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.usuCodigo,
      email: usuario.email,
      username: usuario.usuNombre,
      rol: usuario.idRol,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

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
