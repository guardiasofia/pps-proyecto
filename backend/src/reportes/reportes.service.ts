import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { SolicitudesService } from '../solicitudes/solicitudes.service.js';

@Injectable()
export class ReportesService {
  private readonly fontPath = join(
    dirname(
      createRequire(import.meta.url).resolve('dejavu-fonts-ttf/package.json'),
    ),
    'ttf',
    'DejaVuSans.ttf',
  );

  constructor(private readonly solicitudesService: SolicitudesService) {}

  async generarReporteSolicitud(id: string): Promise<Buffer> {
    const { solicitud, empleado, direccion, foto, catalogosSolicitados } =
      await this.solicitudesService.findReportData(id);
    const document = new PDFDocument({
      size: 'A4',
      margins: { top: 48, left: 48, right: 48, bottom: 68 },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    const completed = new Promise<Buffer>((resolve, reject) => {
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
    });

    document.font(this.fontPath);
    document
      .fontSize(9)
      .fillColor('#147d72')
      .text('MUNICIPALIDAD DE CONCORDIA  |  GESTION INTERNA');
    document
      .moveDown(0.8)
      .fillColor('#172b2a')
      .fontSize(19)
      .text('Solicitud de actualización');
    document
      .moveDown(0.25)
      .fontSize(10)
      .fillColor('#52615f')
      .text(`Identificador: ${solicitud.id}   |   Estado: ${solicitud.estado}`);
    document.text(
      `Creada: ${this.formatearFecha(solicitud.creadoEn)}${solicitud.aprobadoEn ? `   |   Aprobada: ${this.formatearFecha(solicitud.aprobadoEn)}` : ''}`,
    );
    document.moveDown(1);

    const fotoSolicitada = solicitud.cambios?.foto;
    const fotoData =
      typeof fotoSolicitada === 'string'
        ? Buffer.from(fotoSolicitada.split(',')[1] ?? '', 'base64')
        : foto?.contenido
          ? Buffer.from(foto.contenido)
          : null;
    if (fotoData) {
      try {
        document.image(fotoData, 425, 110, {
          fit: [110, 110],
          align: 'right',
          valign: 'center',
        });
      } catch {
        document
          .fillColor('#52615f')
          .fontSize(8)
          .text('Foto no disponible para vista previa', 425, 110, {
            width: 110,
          });
      }
    }

    document.fillColor('#172b2a').fontSize(13).text('Legajo');
    document.moveDown(0.35).fontSize(10);
    document.text(
      `Empleado: ${[empleado?.nombres, empleado?.apellido].filter(Boolean).join(' ') || 'No informado'}`,
      { width: fotoData ? 330 : undefined },
    );
    document.text(`Número de legajo: ${solicitud.empleadoId}`, {
      width: fotoData ? 330 : undefined,
    });
    document.text(
      `Función actual: ${empleado?.funcion?.funcion ?? 'Sin informar'}`,
      { width: fotoData ? 330 : undefined },
    );
    document.text(
      `Repartición actual: ${empleado?.reparticion?.nombre ?? 'Sin informar'}`,
      { width: fotoData ? 330 : undefined },
    );
    document.moveDown(1).fontSize(13).text('Cambios solicitados');
    document.moveDown(0.35);

    const actuales = this.valoresActuales(empleado, direccion);
    for (const [field, value] of Object.entries(solicitud.cambios ?? {})) {
      if (field === 'foto' || field === 'certificadoDiscapacidad') {
        document
          .fontSize(10)
          .fillColor('#172b2a')
          .text(`${this.nombreCampo(field)}: archivo adjunto`);
        document
          .fillColor('#52615f')
          .fontSize(9)
          .text(
            `Actual: ${solicitud.valoresAnteriores?.[field] ?? 'Sin informar'}`,
          );
        document.moveDown(0.5);
        continue;
      }

      document
        .fontSize(10)
        .fillColor('#172b2a')
        .text(this.nombreCampo(field), { continued: false });
      document
        .fillColor('#52615f')
        .fontSize(9)
        .text(
          `Actual: ${this.formatearValor(field, solicitud.valoresAnteriores?.[field] ?? actuales[field] ?? 'Sin informar')}`,
          { indent: 10 },
        );
      document
        .fillColor('#147d72')
        .fontSize(9)
        .text(`Solicitado: ${this.formatearValor(field, field === 'funcion' ? catalogosSolicitados?.funcion ?? value : field === 'reparticion' ? catalogosSolicitados?.reparticion ?? value : value)}`, {
          indent: 10,
        });
      document.moveDown(0.5);
    }

    if (solicitud.observacion) {
      document
        .moveDown(0.5)
        .fillColor('#172b2a')
        .fontSize(12)
        .text('Observación de RRHH');
      document.fontSize(10).fillColor('#52615f').text(solicitud.observacion);
    }

    const range = document.bufferedPageRange();
    for (let page = range.start; page < range.start + range.count; page++) {
      document.switchToPage(page);
      document
        .fontSize(8)
        .fillColor('#6b7876')
        .text(`Documento interno  |  ${page + 1} / ${range.count}`, 48, 790, {
          width: 499,
          align: 'right',
          lineBreak: false,
        });
    }

    document.end();
    return completed;
  }

  private valoresActuales(
    empleado: any,
    direccion: any,
  ): Record<string, string> {
    return {
      domicilio:
        [
          direccion?.calle,
          direccion?.callenro,
          direccion?.barrio,
          direccion?.ciudad,
          direccion?.provincia,
        ]
          .filter(Boolean)
          .join(' ') || 'Sin informar',
      telefono: direccion?.tel1 ?? 'Sin informar',
      telefonos:
        [direccion?.tel1, direccion?.tel2].filter(Boolean).join(', ') ||
        'Sin informar',
      email: direccion?.email ?? 'Sin informar',
      correoElectronico: direccion?.email ?? 'Sin informar',
      estadoCivil: empleado?.estadocivil ?? 'Sin informar',
      funcion: empleado?.funcion?.funcion ?? 'Sin informar',
      reparticion: empleado?.reparticion?.nombre ?? 'Sin informar',
    };
  }

  private nombreCampo(field: string): string {
    return field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
  }

  private formatearValor(field: string, value: unknown): string {
    if (field === 'poseeCud') return value === true ? 'Sí' : 'No';
    if (field === 'familiares' && Array.isArray(value)) {
      return value
        .map((person) => {
          const item = person as Record<string, unknown>;
          const documento = [item['tipoDocumento'], item['numeroDocumento']].filter(Boolean).join(' ');
          return `${item['apellidos'] ?? ''}, ${item['nombres'] ?? ''} (${item['vinculo'] ?? ''})${documento ? `, ${documento}` : ''}${item['telefono'] ? `, tel. ${item['telefono']}` : ''}`;
        })
        .join('; ');
    }
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  private formatearFecha(fecha?: string | Date): string {
    return fecha ? new Date(fecha).toLocaleString('es-AR') : 'No informada';
  }
}
