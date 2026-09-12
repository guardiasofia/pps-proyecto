import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
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
    const userRoles = [user?.roles, user?.rol, user?.role]
      .flatMap((role) => (Array.isArray(role) ? role : [role]))
      .filter(Boolean)
      .map((role) => {
        const normalized = String(role).trim();

        if (normalized === '1' || normalized.toLowerCase() === 'rrhh') {
          return 'RRHH';
        }

        if (normalized === '2' || normalized.toLowerCase() === 'empleado') {
          return 'EMPLEADO';
        }

        return normalized;
      });

    const hasRole = requiredRoles.some((role) =>
      userRoles.some(
        (userRole: unknown) => String(userRole).toLowerCase() === String(role).toLowerCase(),
      ),
    );

    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    return true;
  }
}
