import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthorized) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = route.data['roles'] as string[] | undefined;
  if (!auth.isAuthorized) return inject(Router).createUrlTree(['/login']);
  if (!roles?.length) return true;

  const currentRole = String(auth.currentUser?.rol ?? '').toLowerCase();
  const isRrhh = ['1', 'rrhh', 'rrhh-admin', 'admin'].includes(currentRole);
  const isEmployee = ['2', 'empleado'].includes(currentRole);
  if (roles.includes('RRHH')) return isRrhh;
  if (roles.includes('EMPLEADO')) return isEmployee;
  return true;
};
