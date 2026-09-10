import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRoles = Array.isArray(user?.roles)
      ? user.roles
      : [user?.rol ?? user?.role ?? user?.roles].filter(Boolean);

    const hasRole = requiredRoles.some((role) =>
      userRoles.some(
        (userRole: unknown) => String(userRole).toLowerCase() === String(role).toLowerCase(),
      ),
    );

    if (!hasRole) {
      throw new UnauthorizedException('No tienes permisos para esta acción');
    }

    return true;
  }
}
