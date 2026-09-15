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

  it('rechaza correo y teléfono con formato inválido', () => {
    const service = new SolicitudesService();

    expect(() => service.create({ cambios: { email: 'correo-invalido' } }, '1002')).toThrow(BadRequestException);
    expect(() => service.create({ cambios: { telefono: 'abc' } }, '1002')).toThrow(BadRequestException);
  });

  it('valida el catálogo de funciones y la relación entre CUD y certificado', () => {
    const service = new SolicitudesService();

    expect(() => service.create({ cambios: { funcion: 'Cargo inventado' } }, '1002')).toThrow(BadRequestException);
    expect(() => service.create({ cambios: { poseeCud: true } }, '1002')).toThrow(BadRequestException);
    expect(() => service.create({ cambios: { poseeCud: false, certificadoDiscapacidad: 'data:application/pdf;base64,JVBERi0=' } }, '1002')).toThrow(BadRequestException);
  });
});
