import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { SolicitudDatosDto } from './create-solicitud.dto.js';

describe('SolicitudDatosDto', () => {
  it('acepta familiar con todos los datos del formulario físico', async () => {
    const dto = plainToInstance(SolicitudDatosDto, {
      familiares: [{
        apellidos: 'Pérez',
        nombres: 'Ana María',
        tipoDocumento: 'DNI',
        numeroDocumento: '30123456',
        sexo: 'F',
        fechaNacimiento: '1990-05-14',
        vinculo: 'Hijo/a',
        telefono: '345 4123456',
        discapacitado: false,
      }],
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('rechaza familiar incompleto y catálogo que no sea un ID numérico', async () => {
    const dto = plainToInstance(SolicitudDatosDto, {
      familiares: [{ apellidos: 'Pérez', nombres: 'Ana', vinculo: 'Hijo/a' }],
      funcion: 'Chofer',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('funcion');
    expect(errors.map((error) => error.property)).toContain('familiares');
  });
});