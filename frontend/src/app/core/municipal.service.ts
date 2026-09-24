import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  reparticion?: string;
  funcion?: string;
  estado?: string;
}

export interface Solicitud {
  id: number | string;
  tipo: string;
  estado: string;
  fecha?: string;
  solicitante?: string;
  cambios?: Record<string, unknown>;
}

export interface Familiar {
  nombre: string;
  vinculo: string;
  telefono?: string;
}

export interface FichaEmpleado {
  legajo: number;
  nombre: string;
  apellido: string;
  dni?: string;
  nacimiento?: string;
  nacionalidad?: string;
  cuil?: string;
  estadoCivil?: string;
  funcion?: string;
  reparticion?: string;
  estado?: string;
  direccion?: Record<string, unknown> | null;
  familiares: Array<Record<string, unknown>>;
  estudios: Array<Record<string, unknown>>;
  cud?: Record<string, unknown> | null;
  cuenta?: Record<string, unknown> | null;
  catalogos?: { estudios: Array<Record<string, unknown>> };
}

@Injectable({ providedIn: 'root' })
export class MunicipalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getEmpleados() {
    return this.http.get<BackendEmpleado[]>(`${this.apiUrl}/empleados`).pipe(
      map((employees) => employees.map((employee) => ({
        id: employee.legajo,
        nombre: employee.nombres ?? '',
        apellido: employee.apellido ?? '',
        dni: employee.nrodocumento,
        reparticion: employee.reparticion?.nombre,
        funcion: employee.funcion?.funcion,
        estado: employee.estado,
      })))
    );
  }

  getSolicitudes() {
    return this.http.get<BackendSolicitud[]>(`${this.apiUrl}/solicitudes`).pipe(
      map((requests) => requests.map((request) => ({
        id: request.id,
        tipo: request.tipo,
        estado: request.estado,
        fecha: request.creadoEn ? new Date(request.creadoEn).toLocaleDateString('es-AR') : undefined,
        solicitante: request.legajo ? `Legajo ${request.legajo}` : undefined,
        cambios: request.cambios,
      })))
    );
  }

  crearSolicitud(campo: string, valor: string | string[] | Familiar[] | Record<string, unknown>) {
    const cambios = campo === 'poseeCud' && !Array.isArray(valor) && typeof valor === 'object'
      ? valor
      : { [campo]: valor };
    return this.http.post<BackendSolicitud>(`${this.apiUrl}/solicitudes`, {
      cambios,
    });
  }

  aprobarSolicitud(id: number | string, observacion = '') {
    return this.http.patch<BackendSolicitud>(`${this.apiUrl}/solicitudes/${id}/aprobar`, {
      aprobadoPor: 'rrhh-admin',
      observacion,
    });
  }

  descargarReporteSolicitud(id: number | string) {
    return this.http.get(`${this.apiUrl}/reportes/solicitud/${id}/pdf`, { responseType: 'blob' });
  }

  getMiFicha() {
    return this.http.get<BackendFichaEmpleado>(`${this.apiUrl}/empleados/me`).pipe(
      map((employee) => ({
        legajo: employee.legajo,
        nombre: employee.nombres ?? '',
        apellido: employee.apellido ?? '',
        dni: employee.nrodocumento,
        nacimiento: employee.f_nacimiento,
        nacionalidad: employee.nacionalidad,
        cuil: employee.cuil,
        estadoCivil: employee.estadocivil,
        funcion: employee.funcion?.funcion,
        reparticion: employee.reparticion?.nombre,
        estado: employee.estado,
        direccion: employee.direccion,
        familiares: employee.familiares ?? [],
        estudios: employee.estudios ?? [],
        cud: employee.cud,
        cuenta: employee.cuenta,
        catalogos: employee.catalogos,
      })),
    );
  }
}

interface BackendEmpleado {
  legajo: number;
  nombres?: string;
  apellido?: string;
  nrodocumento?: string;
  estado?: string;
  funcion?: { funcion?: string };
  reparticion?: { nombre?: string };
}

interface BackendSolicitud {
  id: string;
  tipo: string;
  estado: string;
  creadoEn?: string;
  legajo?: string;
  cambios?: Record<string, unknown>;
}

interface BackendFichaEmpleado {
  legajo: number;
  nombres?: string;
  apellido?: string;
  nrodocumento?: string;
  f_nacimiento?: string;
  nacionalidad?: string;
  cuil?: string;
  estadocivil?: string;
  estado?: string;
  funcion?: { funcion?: string };
  reparticion?: { nombre?: string };
  direccion?: Record<string, unknown> | null;
  familiares?: Array<Record<string, unknown>>;
  estudios?: Array<Record<string, unknown>>;
  cud?: Record<string, unknown> | null;
  cuenta?: Record<string, unknown> | null;
  catalogos?: { estudios: Array<Record<string, unknown>> };
}