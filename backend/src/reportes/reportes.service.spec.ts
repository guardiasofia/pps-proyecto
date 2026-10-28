import { describe, expect, it } from 'vitest';
import { ReportesService } from './reportes.service.js';

describe('ReportesService', () => {
  it('genera un PDF paginado con datos personales y cambios solicitados', async () => {
    const service = new ReportesService({
      findReportData: async () => ({
        solicitud: {
          id: 'SOL-123',
          empleadoId: 1001,
          estado: 'pendiente',
          creadoEn: '2026-09-23T10:00:00.000Z',
          cambios: {
            domicilio:
              'San Martín 123 con un texto extenso, comillas “tipográficas” y guion largo — '.repeat(
                20,
              ),
            email: 'ana@gmail.com',
            familiares: Array.from({ length: 22 }, (_, index) => ({
              nombre: `Persona ${index}`,
              vinculo: 'Familiar',
            })),
          },
        },
        empleado: { nombres: 'Ana', apellido: 'Pérez' },
        direccion: {
          calle: 'San Martín',
          callenro: '123',
          email: 'ana@gmail.com',
        },
        foto: null,
      }),
    } as never);

    const pdf = await service.generarReporteSolicitud('SOL-123');

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.toString('latin1')).toContain('%PDF');
    const pageCount = Number(
      pdf.toString('latin1').match(/\/Count (\d+)/)?.[1] ?? 0,
    );
    expect(pageCount).toBeGreaterThan(1);
    expect(pdf.toString('latin1')).toContain('/FontFile2');
  });
});
