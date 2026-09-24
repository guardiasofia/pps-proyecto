import { Injectable } from '@nestjs/common';
import { SolicitudesService } from '../solicitudes/solicitudes.service.js';

@Injectable()
export class ReportesService {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  generarReporteEmpleado(id: string) {
    return this.generarPdf(`Reporte de empleado ${id}`, [
      `Identificador de empleado: ${id}`,
      'Este documento corresponde al directorio municipal.',
    ]);
  }

  generarReporteSolicitud(id: string) {
    const solicitud = this.solicitudesService.findOne(id);
    const cambios = solicitud.cambios ?? {};
    const lineas = [
      `Identificador: ${solicitud.id}`,
      `Empleado: ${solicitud.empleadoId ?? solicitud.legajo ?? 'No informado'}`,
      `Estado: ${solicitud.estado ?? 'No informado'}`,
      `Fecha de creación: ${this.formatearFecha(solicitud.creadoEn)}`,
      '',
      'Datos solicitados para actualización:',
      ...this.formatearCambios(cambios),
    ];

    return this.generarPdf(`Solicitud de actualización ${id}`, lineas);
  }

  private generarPdf(titulo: string, lineas: string[]) {
    const texto = [titulo, '', ...lineas]
      .map((linea, index) => `${index === 0 ? '/F1 16 Tf' : '/F1 10 Tf'} 1 0 0 1 48 ${760 - index * 18} Tm (${this.escaparTextoPdf(linea)}) Tj`)
      .join('\n');
    const stream = [
      'q 0.03 0.5 0.47 rg 0 790 595 52 re f Q',
      'q 0.94 0.97 0.96 rg 36 55 523 710 re f Q',
      'q 1 1 1 rg 42 61 511 698 re f Q',
      'BT /F1 9 Tf 1 1 1 rg 48 816 Tm (MUNICIPALIDAD DE CONCORDIA  |  GESTION INTERNA) Tj ET',
      'BT 0.1 0.14 0.17 rg', texto, 'ET',
      'q 0.85 0.9 0.88 RG 42 742 511 0.5 re S Q',
    ].join('\n') + '\n';
    const objetos = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    ];
    let contenido = '%PDF-1.4\n';
    const offsets = [0];

    objetos.forEach((objeto, index) => {
      offsets.push(Buffer.byteLength(contenido, 'latin1'));
      contenido += `${index + 1} 0 obj\n${objeto}\nendobj\n`;
    });

    const inicioXref = Buffer.byteLength(contenido, 'latin1');
    contenido += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    contenido += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
    contenido += `trailer\n<< /Root 1 0 R /Size ${objetos.length + 1} >>\nstartxref\n${inicioXref}\n%%EOF`;

    return Buffer.from(contenido, 'latin1');
  }

  private formatearCambios(cambios: Record<string, unknown>): string[] {
    return Object.entries(cambios).map(([campo, valor]) => {
      if (campo === 'familiares' && Array.isArray(valor)) {
        return `${this.nombreCampo(campo)}: ${valor.map((familiar) => {
          const item = familiar as Record<string, unknown>;
          const telefono = item.telefono ? `, tel. ${item.telefono}` : '';
          return `${item.nombre ?? ''} (${item.vinculo ?? ''}${telefono})`;
        }).join('; ')}`;
      }

      if (campo === 'foto' || campo === 'certificadoDiscapacidad') {
        return `${this.nombreCampo(campo)}: archivo adjunto`;
      }

      return `${this.nombreCampo(campo)}: ${String(valor)}`;
    });
  }

  private nombreCampo(campo: string): string {
    return campo.replace(/[A-Z]/g, (letra) => ` ${letra.toLowerCase()}`);
  }

  private formatearFecha(fecha?: string): string {
    return fecha ? new Date(fecha).toLocaleString('es-AR') : 'No informada';
  }

  private escaparTextoPdf(value: string): string {
    return this.normalizarTextoPdf(value).replace(/[\\()]/g, (caracter) => `\\${caracter}`);
  }

  private normalizarTextoPdf(value: string): string {
    const mapa: Record<string, string> = {
      á: '\xE1',
      é: '\xE9',
      í: '\xED',
      ó: '\xF3',
      ú: '\xFA',
      ü: '\xFC',
      Á: '\xC1',
      É: '\xC9',
      Í: '\xCD',
      Ó: '\xD3',
      Ú: '\xDA',
      Ü: '\xDC',
      ñ: '\xF1',
      Ñ: '\xD1',
    };

    return value.replace(/[áéíóúüÁÉÍÓÚÜñÑ]/g, (char) => mapa[char] ?? char);
  }
}
