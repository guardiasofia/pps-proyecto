import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, forkJoin, of } from 'rxjs';
import { AuthService } from './core/auth.service';
import { Empleado, FichaEmpleado, Familiar, MunicipalService, Solicitud, SolicitudCatalogos } from './core/municipal.service';
import { LoginComponent } from './auth/login.component';
import { EmployeeViewComponent } from './employee/employee-view.component';
import { HrViewComponent } from './hr/hr-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, LoginComponent, EmployeeViewComponent, HrViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly municipalService = inject(MunicipalService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  activeSection = 'Resumen';
  search = '';
  requestField = 'domicilio';
  requestValue = '';
  familyName = '';
  familyRelation = '';
  familyPhone = '';
  familyDisability: boolean | null = null;
  familyLastName = '';
  familyDocumentType = '';
  familyDocumentNumber = '';
  familySex = '';
  familyBirthDate = '';
  pendingChanges: Record<string, unknown> = {};
  requestError = '';
  catalogosSolicitud: SolicitudCatalogos = { reparticiones: [], funciones: [], parentescos: [], estadosCiviles: [] };
  poseeCud: boolean | null = null;
  requestFile: File | null = null;
  fileError = '';
  readingFile = false;
  showRequestForm = false;
  loading = true;
  loginToken = '';
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
  readonly tiposDocumento = ['DNI', 'LC', 'LE', 'CI', 'Pasaporte'];
  readonly sexos = [{ value: 'F', label: 'Femenino' }, { value: 'M', label: 'Masculino' }, { value: 'X', label: 'Otro / no especificado' }];

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const segments = this.router.url.split('?')[0].split('/').filter(Boolean);
      this.activeSection = segments[0] === 'rrhh' ? this.titleCase(segments[1] ?? 'Resumen') : segments[0] === 'empleado' ? 'Inicio' : 'Login';
      if (this.isAuthenticated && segments[0] !== 'login') this.refresh();
    });
    if (this.isAuthenticated) {
      this.loadSolicitudCatalogos();
      void this.router.navigate([this.isBackOffice ? '/rrhh/Resumen' : '/empleado']);
    } else {
      void this.router.navigate(['/login']);
    }
  }

  private titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  loadSolicitudCatalogos() {
    this.municipalService.getCatalogosSolicitud().subscribe({
      next: (catalogos) => { this.catalogosSolicitud = catalogos; },
      error: () => { this.apiError = 'No se pudieron cargar los catálogos del formulario.'; },
    });
  }

  refresh() {
    this.loading = true;
    this.apiError = '';
    const employees$ = this.isBackOffice ? this.municipalService.getEmpleados() : of([] as Empleado[]);
    const requests$ = this.isBackOffice && this.activeSection !== 'Reportes'
      ? this.municipalService.getSolicitudes('pendiente')
      : this.isBackOffice ? this.municipalService.getSolicitudes('all') : of([] as Solicitud[]);
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
    const role = String(this.authService.currentUser?.rol ?? '').toLowerCase();
    return role === '1' || role === 'rrhh' || role === 'rrhh-admin' || role === 'admin';
  }

  get activeEmployees() {
    return this.employees.filter((employee) => String(employee.estado ?? '').toUpperCase() === 'AC');
  }

  get navItems() {
    return this.isBackOffice
      ? [
          { label: 'Resumen', section: 'Resumen' },
          { label: 'Solicitudes', section: 'Solicitudes' },
          { label: 'Personal', section: 'Personal' },
          { label: 'Reportes', section: 'Reportes' },
        ]
      : [{ label: 'Inicio', section: 'Inicio' }];
  }

  get initials() {
    return this.currentUserName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();
  }

  login() {
    if (!this.loginToken.trim()) return;
    this.loginError = '';
    this.authService.login(this.loginToken).subscribe({
      next: () => {
        this.loginToken = '';
        this.activeSection = this.isBackOffice ? 'Resumen' : 'Inicio';
        this.loadSolicitudCatalogos();
        this.refresh();
      },
      error: () => { this.loginError = 'El token no es válido o expiró. Solicitá uno vigente al proveedor de identidad.'; },
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
    const total = this.activeEmployees.length;
    const groups = new Map<string, number>();
    this.activeEmployees.forEach((employee) => {
      const area = employee.reparticion || 'Sin repartición';
      groups.set(area, (groups.get(area) ?? 0) + 1);
    });
    const sortedGroups = [...groups.entries()].sort(([, countA], [, countB]) => countB - countA);
    const exactPercentages = sortedGroups.map(([, count]) => total ? count * 100 / total : 0);
    const displayPercentages = exactPercentages.map(Math.floor);
    let unallocated = 100 - displayPercentages.reduce((sum, percentage) => sum + percentage, 0);
    const remainderIndexes = exactPercentages
      .map((percentage, index) => ({ index, remainder: percentage - Math.floor(percentage) }))
      .sort((first, second) => second.remainder - first.remainder);
    for (const item of remainderIndexes) {
      if (unallocated <= 0) break;
      displayPercentages[item.index] += 1;
      unallocated -= 1;
    }
    return sortedGroups.map(([name, count], index) => ({
      name,
      count,
      percentage: total ? displayPercentages[index] : 0,
      color: ['#2868a2', '#d19b35', '#31866d', '#c65c48', '#6657a6', '#468eac'][index % 6],
    }));
  }

  get distributionGradient() {
    let stop = 0;
    const segments = this.personalDistribution.map((group) => {
      const start = stop;
      stop += this.activeEmployees.length ? group.count * 100 / this.activeEmployees.length : 0;
      return `${group.color} ${start}% ${stop}%`;
    });
    return `conic-gradient(${segments.length ? segments.join(', ') : '#e6ecea 0% 100%'})`;
  }

  getRequestChangeEntries(request: Solicitud) {
    const labels: Record<string, string> = {
      domicilio: 'Domicilio', telefono: 'Teléfonos de contacto', telefonos: 'Teléfonos de contacto',
      email: 'Correo electrónico', correoElectronico: 'Correo electrónico', reparticion: 'Repartición',
      estadoCivil: 'Estado civil', familiares: 'Familiares', foto: 'Foto', funcion: 'Función',
      poseeCud: 'CUD', certificadoDiscapacidad: 'Certificado de discapacidad',
    };
    const previous = request.valoresAnteriores ?? {};
    return Object.entries(request.cambios ?? {}).map(([field, value]) => {
      const previousField = field === 'email' ? 'correoElectronico'
        : field === 'correoElectronico' ? 'email'
          : field === 'telefono' ? 'telefonos'
            : field;
      let current = previous[field] ?? previous[previousField] ?? 'Sin informar';
      if (field === 'telefonos' && !Array.isArray(current)) current = current === 'Sin informar' ? current : [current];
      if (field === 'telefono' && current === 'Sin informar' && Array.isArray(previous['telefonos'])) current = previous['telefonos'][0] ?? current;
      if (field === 'telefonos' && current === 'Sin informar' && previous['telefono']) current = [previous['telefono']];
      if (field === 'email' || field === 'correoElectronico') {
        current = previous['email'] ?? previous['correoElectronico'] ?? current;
      }
      return {
        label: labels[field] ?? field,
        value: `${this.formatRequestChange(field, current)} → ${this.formatRequestChange(field, value, request)}`,
      };
    });
  }

  private formatRequestChange(field: string, value: unknown, request?: Solicitud) {
    if (field === 'foto' || field === 'certificadoDiscapacidad') return 'Archivo adjunto';
    if (field === 'poseeCud') return value === true ? 'Sí' : 'No';
    if (field === 'familiares' && Array.isArray(value)) {
      return value.map((family) => {
        const item = family as Record<string, unknown>;
        return `${item['apellidos'] ?? ''}, ${item['nombres'] ?? ''} · ${item['tipoDocumento'] ?? ''} ${item['numeroDocumento'] ?? ''} (${item['vinculo'] ?? ''})`;
      }).join(', ');
    }
    if (field === 'funcion' && request?.catalogosSolicitados?.funcion && value === request.cambios?.['funcion']) {
      return request.catalogosSolicitados.funcion;
    }
    if (field === 'funcion' && typeof value === 'number') return `ID de función ${value}`;
    if (field === 'reparticion' && request?.catalogosSolicitados?.reparticion && value === request.cambios?.['reparticion']) {
      return request.catalogosSolicitados.reparticion;
    }
    if (field === 'reparticion' && typeof value === 'number') return `ID de repartición ${value}`;
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  navigate(section: string) {
    if (!this.isBackOffice) {
      void this.router.navigate(['/empleado']);
      return;
    }
    void this.router.navigate(['/rrhh', section]);
  }

  onAuthenticate(token: string) {
    this.authService.login(token).subscribe({
      next: () => {
        this.loadSolicitudCatalogos();
        void this.router.navigate([this.isBackOffice ? '/rrhh/Resumen' : '/empleado']);
      },
      error: () => this.loginView?.setError('El token no es válido o expiró. Solicitá uno vigente al proveedor de identidad.'),
    });
  }

  changeRequestField(field: string) {
    this.requestField = field;
    this.requestValue = '';
    this.familyName = '';
    this.familyRelation = '';
    this.familyPhone = '';
    this.familyDisability = null;
    this.familyLastName = '';
    this.familyDocumentType = '';
    this.familyDocumentNumber = '';
    this.familySex = '';
    this.familyBirthDate = '';
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
    if (this.requestField !== 'familiares' && Object.hasOwn(this.pendingChanges, this.requestField)) {
      this.requestError = `Ya agregaste ${this.requestField} a esta solicitud.`;
      return;
    }
    const change = this.requestField === 'telefonos'
      ? { telefonos: value as string[] }
      : this.requestField === 'poseeCud'
      ? value as Record<string, unknown>
      : { [this.requestField]: value };
    this.pendingChanges = {
      ...this.pendingChanges,
      ...change,
      ...(this.requestField === 'familiares' && Array.isArray(this.pendingChanges['familiares'])
        ? { familiares: [...this.pendingChanges['familiares'] as Familiar[], ...(change['familiares'] as Familiar[])] }
        : {}),
    };
    this.changeRequestField(this.requestField);
    this.requestError = '';
  }

  removePendingChange(field: string) {
    const { [field]: removed, ...remaining } = this.pendingChanges;
    void removed;
    this.pendingChanges = remaining;
  }

  closeRequestForm() {
    this.showRequestForm = false;
    this.pendingChanges = {};
    this.requestError = '';
    this.changeRequestField('domicilio');
  }

  sendPendingChanges() {
    if (!Object.keys(this.pendingChanges).length) return;
    this.requestError = '';
    this.municipalService.crearSolicitud(this.pendingChanges).subscribe({
      next: () => {
        this.closeRequestForm();
        this.refresh();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        const message = error.error?.message;
        this.requestError = Array.isArray(message) ? message.join(' ') : message ?? 'No se pudo crear la solicitud.';
      },
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

  get requestPayload(): string | number | string[] | Familiar[] | Record<string, unknown> | null {
    if (this.requestField === 'poseeCud') {
      if (this.poseeCud === null) return null;
      if (!this.poseeCud) return { poseeCud: false };
      if (!this.requestFile || !this.requestValue) return null;
      return { poseeCud: true, certificadoDiscapacidad: this.requestValue };
    }
    if (this.requestField === 'familiares') {
      if (!this.familyName.trim() || !this.familyLastName.trim() || !this.familyDocumentType || !this.familyDocumentNumber.trim() || !this.familySex || !this.familyBirthDate || !this.familyRelation.trim()) return null;
      return [{
        apellidos: this.familyLastName.trim(),
        nombres: this.familyName.trim(),
        tipoDocumento: this.familyDocumentType,
        numeroDocumento: this.familyDocumentNumber.trim(),
        sexo: this.familySex,
        fechaNacimiento: this.familyBirthDate,
        vinculo: this.familyRelation.trim(),
        ...(this.familyPhone.trim() ? { telefono: this.familyPhone.trim() } : {}),
        ...(this.familyDisability !== null ? { discapacitado: this.familyDisability } : {}),
      }];
    }

    if (!this.requestValue.trim()) return null;
    if (this.requestField === 'telefonos') {
      const phones = this.requestValue.split(',').map((phone) => phone.trim()).filter(Boolean);
      return phones.length > 0 && phones.length <= 2 ? phones : null;
    }

    if (this.requestField === 'funcion' || this.requestField === 'reparticion') {
      const id = Number(this.requestValue);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    }
    return this.requestValue.trim();
  }

  get requestCanSubmit() {
    return this.requestPayload !== null && !this.requestValidationMessage;
  }

  get pendingChangeEntries() {
    return Object.entries(this.pendingChanges);
  }

  get hasPendingChanges() {
    return this.pendingChangeEntries.length > 0;
  }

  formatPendingValue(field: string, value: unknown) {
    if (field === 'funcion') {
      return this.catalogosSolicitud.funciones.find((item) => item.id === Number(value))?.nombre ?? String(value);
    }
    if (field === 'reparticion') {
      return this.catalogosSolicitud.reparticiones.find((item) => item.id === Number(value))?.nombre ?? String(value);
    }
    return this.formatRequestChange(field, value);
  }

  get requestValidationMessage() {
    if (this.requestField === 'poseeCud') {
      if (this.poseeCud === null) return 'Indicá si posee Certificado Único de Discapacidad.';
      if (this.poseeCud && (!this.requestFile || !this.requestValue)) return 'Adjuntá el certificado de discapacidad.';
      return '';
    }
    if (this.requestField === 'familiares') {
      if (this.familyPhone.trim() && !this.isPhoneValid(this.familyPhone)) return 'El teléfono del familiar no tiene un formato válido.';
      if (this.familyDocumentNumber.trim() && !/^[A-Za-z0-9.-]{3,20}$/.test(this.familyDocumentNumber.trim())) return 'El número de documento debe tener entre 3 y 20 caracteres válidos.';
      return '';
    }

    if (this.requestField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.requestValue.trim())) return 'Ingresá un correo válido, por ejemplo persona@correo.com.';
    if (this.requestField === 'telefono' && !this.isPhoneValid(this.requestValue)) return 'Ingresá un teléfono válido.';
    if (this.requestField === 'telefonos' && this.requestValue.split(',').filter((phone) => phone.trim()).length > 2) return 'Ingresá como máximo dos teléfonos.';
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
    const reportWindow = window.open('', '_blank');
    this.reportLoading = true;
    this.reportError = '';
    this.municipalService.descargarReporteSolicitud(this.reportRequestId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (reportWindow) {
          reportWindow.location.href = url;
          window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } else {
          URL.revokeObjectURL(url);
          this.reportError = 'El navegador bloqueó la ventana del reporte. Permití ventanas emergentes e intentá otra vez.';
        }
        this.reportLoading = false;
      },
      error: () => {
        reportWindow?.close();
        this.reportLoading = false;
        this.reportError = 'No se pudo generar el reporte. Revisá tu sesión y los permisos.';
      },
    });
  }
}