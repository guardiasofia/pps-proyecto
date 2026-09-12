import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { AuthService } from './core/auth.service';
import { Empleado, MunicipalService, Solicitud } from './core/municipal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly municipalService = inject(MunicipalService);
  readonly authService = inject(AuthService);
  activeSection = 'Resumen';
  search = '';
  requestField = 'domicilio';
  requestValue = '';
  showRequestForm = false;
  loading = true;
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  apiError = '';
  approvalError = '';
  approvingId: number | string | null = null;
  reportEmployeeId: number | null = null;
  reportRequestId: number | string | null = null;
  reportError = '';
  reportLoading = false;
  employees: Empleado[] = [];
  requests: Solicitud[] = [];
  readonly estadosCiviles = [
    'Soltero/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
    'Separado/a',
    'Unión convivencial',
  ];
  readonly reparticiones = [
    'CONCEJO DELIBERANTE',
    'JUZGADO DE FALTAS',
    'SECRETARIA DE COORDINACION DE GABINETE Y HACIENDA',
    'SECRETARIA DE DESARROLLO HUMANO',
    'SECRETARIA DE DESARROLLO PRODUCTIVO',
    'SECRETARIA DE GOBIERNO',
    'SECRETARIA DE OBRAS PUBLICAS',
    'SECRETARIA DE SALUD',
    'SECRETARIA DE SERVICIOS PUBLICOS',
  ];

  ngOnInit() {
    if (this.isAuthenticated) this.refresh();
  }

  refresh() {
    this.loading = true;
    this.apiError = '';
    const requests$ = this.isRrhh ? this.municipalService.getSolicitudes() : of([] as Solicitud[]);
    forkJoin({
      employees: this.municipalService.getEmpleados(),
      requests: requests$,
    }).subscribe({
      next: ({ employees, requests }) => {
        this.employees = employees;
        this.requests = requests;
        this.loading = false;
      },
      error: (error: { status?: number }) => {
        this.loading = false;
        this.apiError = error.status === 401 || error.status === 403
          ? 'Tu sesión expiró. Volvé a ingresar.'
          : 'No se pudo conectar con el backend. Verificá que esté ejecutándose en el puerto 3000.';
        if (error.status === 401 || error.status === 403) this.logout();
      },
    });
  }

  get isAuthenticated() {
    return Boolean(this.authService.token);
  }

  get currentUserName() {
    return this.authService.currentUser?.username ?? 'Usuario';
  }

  get currentUserRole() {
    return this.isRrhh ? 'RRHH' : 'Usuario';
  }

  get isRrhh() {
    return String(this.authService.currentUser?.rol ?? '') === '1';
  }

  get initials() {
    return this.currentUserName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();
  }

  login() {
    if (!this.loginEmail.trim() || !this.loginPassword) return;
    this.loginError = '';
    this.authService.login(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: () => {
        this.loginPassword = '';
        this.refresh();
      },
      error: () => { this.loginError = 'Correo o contraseña inválidos.'; },
    });
  }

  logout() {
    this.authService.logout();
    this.employees = [];
    this.requests = [];
  }

  get filteredEmployees() {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.employees;
    return this.employees.filter((employee) =>
      `${employee.nombre} ${employee.apellido} ${employee.reparticion}`.toLowerCase().includes(term)
    );
  }

  setSection(section: string) {
    this.activeSection = section;
  }

  changeRequestField(field: string) {
    this.requestField = field;
    this.requestValue = '';
  }

  approveRequest(request: Solicitud) {
    if (!this.isRrhh || this.approvingId !== null) return;
    this.approvingId = request.id;
    this.approvalError = '';
    this.municipalService.aprobarSolicitud(request.id).subscribe({
      next: () => {
        this.approvingId = null;
        this.refresh();
      },
      error: () => {
        this.approvingId = null;
        this.approvalError = 'No se pudo aprobar la solicitud.';
      },
    });
  }

  submitRequest() {
    if (!this.requestValue.trim()) return;
    this.municipalService.crearSolicitud(this.requestField, this.requestValue.trim()).subscribe({
      next: () => { this.showRequestForm = false; this.requestValue = ''; this.refresh(); },
      error: () => { this.apiError = 'No se pudo crear la solicitud.'; }
    });
  }

  downloadEmployeeReport() {
    if (this.reportEmployeeId === null) return;
    this.downloadBlob(this.municipalService.descargarReporteEmpleado(this.reportEmployeeId), `reporte-empleado-${this.reportEmployeeId}.pdf`);
  }

  downloadRequestReport() {
    if (this.reportRequestId === null || !this.isRrhh) return;
    this.downloadBlob(this.municipalService.descargarReporteSolicitud(this.reportRequestId), `solicitud-${this.reportRequestId}.pdf`);
  }

  private downloadBlob(request: ReturnType<MunicipalService['descargarReporteEmpleado']>, filename: string) {
    this.reportLoading = true;
    this.reportError = '';
    request.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        this.reportLoading = false;
      },
      error: () => {
        this.reportLoading = false;
        this.reportError = 'No se pudo generar el reporte. Revisá tu sesión y los permisos.';
      },
    });
  }
}