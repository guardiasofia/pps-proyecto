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
    const contenido = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 160] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 74 >>\nstream\nBT\n/F1 12 Tf\n30 115 Td\n(${titulo}) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000123 00000 n \n0000000245 00000 n \n0000000841 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n930\n%%EOF`;

    return Buffer.from(contenido, 'latin1');
  }
}
