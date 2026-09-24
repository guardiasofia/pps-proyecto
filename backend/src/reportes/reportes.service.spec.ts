import { describe, expect, it } from 'vitest';
import { ReportesService } from './reportes.service.js';

describe('ReportesService', () => {
  it('genera un PDF para una solicitud de actualización', () => {
    const service = new ReportesService({
      findOne: () => ({
        id: 'SOL-123',
        empleadoId: '1001',
        estado: 'pendiente',
        creadoEn: '2026-09-23T10:00:00.000Z',
        cambios: { domicilio: 'San Martín 123', email: 'ana@gmail.com' },
      }),
    } as never);

    const pdf = service.generarReporteSolicitud('SOL-123');

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.toString('latin1')).toContain('%PDF');
    expect(pdf.toString('latin1')).toContain('SOL-123');
    expect(pdf.toString('latin1')).toContain('San Mart\xEDn 123');
    expect(pdf.toString('latin1')).toContain('ana@gmail.com');
  });
});
