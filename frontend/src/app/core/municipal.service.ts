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
      })))
    );
  }

  crearSolicitud(campo: string, valor: string) {
    return this.http.post<BackendSolicitud>(`${this.apiUrl}/solicitudes`, {
      cambios: { [campo]: valor },
    });
  }

  aprobarSolicitud(id: number | string, observacion = '') {
    return this.http.patch<BackendSolicitud>(`${this.apiUrl}/solicitudes/${id}/aprobar`, {
      aprobadoPor: 'rrhh-admin',
      observacion,
    });
  }

  descargarReporteEmpleado(id: number) {
    return this.http.get(`${this.apiUrl}/reportes/empleado/${id}`, { responseType: 'blob' });
  }

  descargarReporteSolicitud(id: number | string) {
    return this.http.get(`${this.apiUrl}/reportes/solicitud/${id}/pdf`, { responseType: 'blob' });
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
}