import { describe, expect, it } from 'vitest';
import { ReportesService } from './reportes.service.js';

describe('ReportesService', () => {
  it('genera un PDF para una solicitud de actualización', () => {
    const service = new ReportesService();

    const pdf = service.generarReporteSolicitud('SOL-123');

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.toString('latin1')).toContain('%PDF');
    expect(pdf.toString('latin1')).toContain('SOL-123');
  });
});
