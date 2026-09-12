import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportesService {
  generarReporteEmpleado(id: string) {
    return this.generarPdfBasico(`Reporte empleado ${id}`);
  }

  generarReporteSolicitud(id: string) {
    return this.generarPdfBasico(`Solicitud de actualización ${id}`);
  }

  private generarPdfBasico(titulo: string) {
    const textoPdf = this.normalizarTextoPdf(titulo);
    const contenido = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 160] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 82 >>\nstream\nBT\n/F1 12 Tf\n30 115 Td\n(${textoPdf}) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000123 00000 n \n0000000245 00000 n \n0000000861 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n960\n%%EOF`;

    return Buffer.from(contenido, 'latin1');
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
