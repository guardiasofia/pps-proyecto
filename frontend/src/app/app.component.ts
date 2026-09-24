import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { AuthService } from './core/auth.service';
import { Empleado, Familiar, FichaEmpleado, MunicipalService, Solicitud } from './core/municipal.service';

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
  familyName = '';
  familyRelation = '';
  familyPhone = '';
  familyDisability: boolean | null = null;
  poseeCud: boolean | null = null;
  requestFile: File | null = null;
  fileError = '';
  readingFile = false;
  showRequestForm = false;
  loading = true;
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  apiError = '';
  approvalError = '';
  approvingId: number | string | null = null;
  reportRequestId: number | string | null = null;
  reportError = '';
  reportLoading = false;
  employees: Empleado[] = [];
  requests: Solicitud[] = [];
  employeeProfile: FichaEmpleado | null = null;
  readonly estadosCiviles = [
    'Soltero/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
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
  readonly funciones = [
    'Administrativo', 'Operario', 'Maestranza', 'Chofer', 'Guardavida', 'Guardaparques',
    'Guía Turístico', 'Inspector', 'Profesional de la Salud', 'Docente', 'Profesional Informático',
    'Profesional en general', 'Técnico en general', 'Personal de Seguridad', 'Cajero', 'Juez',
    'Fiscal', 'Concejal',
  ];
  readonly vinculosFamiliares = [
    'Cónyuge', 'Hijo/a', 'Padre/Madre', 'Hermano/a', 'Abuelo/a', 'Nieto/a', 'Otro familiar',
  ];

  ngOnInit() {
    if (this.isAuthenticated) {
      this.activeSection = this.isBackOffice ? 'Resumen' : 'Inicio';
      this.refresh();
    }
  }

  refresh() {
    this.loading = true;
    this.apiError = '';
    const employees$ = this.isBackOffice ? this.municipalService.getEmpleados() : of([] as Empleado[]);
    const requests$ = this.isBackOffice ? this.municipalService.getSolicitudes() : of([] as Solicitud[]);
    const profile$ = this.isBackOffice ? of(null) : this.municipalService.getMiFicha();
    forkJoin({
      employees: employees$,
      requests: requests$,
      profile: profile$,
    }).subscribe({
      next: ({ employees, requests, profile }) => {
        this.employees = employees;
        this.requests = requests;
        this.employeeProfile = profile;
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
    return this.isBackOffice ? 'Administración / RRHH' : 'Empleado';
  }

  get isRrhh() {
    return this.isBackOffice;
  }

  get isBackOffice() {
    return String(this.authService.currentUser?.rol ?? '') === '1';
  }

  get navItems() {
    return this.isBackOffice
      ? ['Resumen', 'Solicitudes', 'Personal', 'Reportes']
      : ['Inicio', 'Nueva solicitud'];
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
        this.activeSection = this.isBackOffice ? 'Resumen' : 'Inicio';
        this.refresh();
      },
      error: () => { this.loginError = 'Correo o contraseña inválidos.'; },
    });
  }

  logout() {
    this.authService.logout();
    this.employees = [];
    this.requests = [];
    this.employeeProfile = null;
  }

  get filteredEmployees() {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.employees;
    return this.employees.filter((employee) =>
      `${employee.nombre} ${employee.apellido} ${employee.reparticion}`.toLowerCase().includes(term)
    );
  }

  get personalDistribution() {
    const total = this.employees.length;
    const groups = new Map<string, number>();
    this.employees.forEach((employee) => {
      const area = employee.reparticion || 'Sin repartición';
      groups.set(area, (groups.get(area) ?? 0) + 1);
    });
    return [...groups.entries()].sort(([, countA], [, countB]) => countB - countA).slice(0, 3).map(([name, count], index) => ({
      name,
      percentage: total ? Math.round(count * 100 / total) : 0,
      color: ['blue', 'amber', 'green'][index],
    }));
  }

  getRequestChangeEntries(request: Solicitud) {
    const labels: Record<string, string> = {
      domicilio: 'Domicilio', telefono: 'Teléfono personal', telefonos: 'Teléfonos adicionales',
      email: 'Correo electrónico', correoElectronico: 'Correo electrónico', reparticion: 'Repartición',
      estadoCivil: 'Estado civil', familiares: 'Familiares', foto: 'Foto', funcion: 'Función',
      poseeCud: 'CUD', certificadoDiscapacidad: 'Certificado de discapacidad',
    };
    return Object.entries(request.cambios ?? {}).map(([field, value]) => ({
      label: labels[field] ?? field,
      value: this.formatRequestChange(field, value),
    }));
  }

  private formatRequestChange(field: string, value: unknown) {
    if (field === 'foto' || field === 'certificadoDiscapacidad') return 'Archivo adjunto';
    if (field === 'poseeCud') return value === true ? 'Sí' : 'No';
    if (field === 'familiares' && Array.isArray(value)) {
      return value.map((family) => {
        const item = family as Record<string, unknown>;
        return `${item['nombre'] ?? ''} (${item['vinculo'] ?? ''})`;
      }).join(', ');
    }
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  setSection(section: string) {
    if (!this.isBackOffice && section === 'Nueva solicitud') {
      this.showRequestForm = true;
      return;
    }
    this.activeSection = section;
  }

  changeRequestField(field: string) {
    this.requestField = field;
    this.requestValue = '';
    this.familyName = '';
    this.familyRelation = '';
    this.familyPhone = '';
    this.familyDisability = null;
    this.poseeCud = null;
    this.requestFile = null;
    this.fileError = '';
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
    const value = this.requestPayload;
    if (value === null) return;
    this.municipalService.crearSolicitud(this.requestField, value).subscribe({
      next: () => { this.showRequestForm = false; this.requestValue = ''; this.refresh(); },
      error: () => { this.apiError = 'No se pudo crear la solicitud.'; }
    });
  }

  selectRequestFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.requestFile = null;
    this.requestValue = '';
    this.fileError = '';

    if (!file) return;
    const isPhoto = this.requestField === 'foto';
    const acceptedType = isPhoto
      ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type);
    if (!acceptedType) {
      this.fileError = isPhoto ? 'Elegí una imagen JPG, PNG o WEBP.' : 'Elegí una imagen JPG, PNG, WEBP o PDF.';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'El archivo no puede superar los 5 MB.';
      input.value = '';
      return;
    }

    this.requestFile = file;
    this.readingFile = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.requestValue = typeof reader.result === 'string' ? reader.result : '';
      this.readingFile = false;
    };
    reader.onerror = () => {
      this.requestFile = null;
      this.fileError = 'No se pudo leer el archivo.';
      this.readingFile = false;
    };
    reader.readAsDataURL(file);
  }

  get requestPayload(): string | string[] | Familiar[] | Record<string, unknown> | null {
    if (this.requestField === 'poseeCud') {
      if (this.poseeCud === null) return null;
      if (!this.poseeCud) return { poseeCud: false };
      if (!this.requestFile || !this.requestValue) return null;
      return { poseeCud: true, certificadoDiscapacidad: this.requestValue };
    }
    if (this.requestField === 'familiares') {
      if (!this.familyName.trim() || !this.familyRelation.trim()) return null;
      return [{
        nombre: this.familyName.trim(),
        vinculo: this.familyRelation.trim(),
        ...(this.familyPhone.trim() ? { telefono: this.familyPhone.trim() } : {}),
        ...(this.familyDisability !== null ? { discapacitado: this.familyDisability } : {}),
      }];
    }

    if (!this.requestValue.trim()) return null;
    if (this.requestField === 'telefonos') {
      const phones = this.requestValue.split(',').map((phone) => phone.trim()).filter(Boolean);
      return phones.length ? phones : null;
    }

    return this.requestValue.trim();
  }

  get requestCanSubmit() {
    return this.requestPayload !== null && !this.requestValidationMessage;
  }

  get requestValidationMessage() {
    if (this.requestField === 'poseeCud') {
      if (this.poseeCud === null) return 'Indicá si posee Certificado Único de Discapacidad.';
      if (this.poseeCud && (!this.requestFile || !this.requestValue)) return 'Adjuntá el certificado de discapacidad.';
      return '';
    }
    if (this.requestField === 'familiares') {
      if (this.familyPhone.trim() && !this.isPhoneValid(this.familyPhone)) return 'El teléfono del familiar no tiene un formato válido.';
      return '';
    }

    if (this.requestField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.requestValue.trim())) return 'Ingresá un correo válido, por ejemplo persona@correo.com.';
    if (this.requestField === 'telefono' && !this.isPhoneValid(this.requestValue)) return 'Ingresá un teléfono válido.';
    if (this.requestField === 'telefonos' && this.requestValue.split(',').some((phone) => phone.trim() && !this.isPhoneValid(phone))) return 'Revisá el formato de los teléfonos separados por coma.';
    if (this.requestField === 'domicilio' && this.requestValue.trim().length > 0 && this.requestValue.trim().length < 5) return 'El domicilio debe tener al menos 5 caracteres.';
    if ((this.requestField === 'foto' || this.requestField === 'certificadoDiscapacidad') && (!this.requestFile || !this.requestValue)) return 'Seleccioná un archivo válido.';
    return '';
  }

  private isPhoneValid(value: string) {
    return /^[+]?[(]?\d[\d\s().-]{6,18}\d$/.test(value.trim());
  }

  downloadRequestReport() {
    if (this.reportRequestId === null || !this.isRrhh) return;
    this.downloadBlob(this.municipalService.descargarReporteSolicitud(this.reportRequestId), `solicitud-${this.reportRequestId}.pdf`);
  }

  private downloadBlob(request: ReturnType<MunicipalService['descargarReporteSolicitud']>, filename: string) {
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