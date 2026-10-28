import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { EmployeeViewComponent } from './employee/employee-view.component';
import { HrViewComponent } from './hr/hr-view.component';
import { authGuard, roleGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'empleado', component: EmployeeViewComponent, canActivate: [authGuard], data: { roles: ['EMPLEADO'] } },
  { path: 'rrhh/:section', component: HrViewComponent, canActivate: [authGuard, roleGuard], data: { roles: ['RRHH'] } },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];