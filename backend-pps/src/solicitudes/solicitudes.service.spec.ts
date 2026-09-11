import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { SolicitudesService } from './solicitudes.service.js';

describe('SolicitudesService', () => {
  it('solo acepta los campos permitidos para actualización de datos', () => {
    const service = new SolicitudesService();

    expect(() =>
      service.create(
        {
          empleadoId: '1002',
          cambios: {
            domicilio: 'Belgrano 456',
            email: 'nuevo@mail.com',
          },
        },
        '1002',
      ),
    ).not.toThrow();

    expect(() =>
      service.create(
        {
          empleadoId: '1002',
          cambios: {
            nombre: 'Carlos',
          },
        },
        '1002',
      ),
    ).toThrow(BadRequestException);
  });

  it('solo devuelve solicitudes pendientes', () => {
    const service = new SolicitudesService();

    const solicitudes = service.findAll();

    expect(solicitudes.length).toBeGreaterThan(0);
    expect(solicitudes.every((solicitud) => solicitud.estado === 'pendiente')).toBe(true);
  });
});
