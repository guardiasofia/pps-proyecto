import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { json } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthModule } from '../src/auth/auth.module.js';
import { SolicitudesController } from '../src/solicitudes/solicitudes.controller.js';
import { SolicitudesService } from '../src/solicitudes/solicitudes.service.js';

const SECRET = 'e2e-secret';
const token = (claims: Record<string, unknown>) =>
  jwt.sign(claims, SECRET, { algorithm: 'HS256', expiresIn: '5m' });

describe('Solicitudes (e2e, sin base de datos)', () => {
  let app: INestApplication;
  const service = {
    create: vi.fn(async (body: unknown, userId: unknown) => ({ body, userId })),
    aprobar: vi.fn(async (id: string, data: unknown) => ({ id, data })),
    rechazar: vi.fn(async (id: string, data: unknown) => ({ id, data })),
    findAll: vi.fn(async () => []),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    delete process.env.JWT_PUBLIC_KEY;
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [SolicitudesController],
      providers: [{ provide: SolicitudesService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(json({ limit: '8mb' }));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rechaza sin token', async () => {
    await request(app.getHttpServer()).post('/api/solicitudes').send({}).expect(401);
  });

  it('acepta el payload que envía el frontend y pasa la identidad del token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token({ sub: 3, rol: 2 })}`)
      .send({
        cambios: {
          domicilio: 'Belgrano 456',
          telefonos: ['345 4123456'],
          reparticion: 2,
          familiares: [
            {
              apellidos: 'Gómez',
              nombres: 'Ana',
              tipoDocumento: 'DNI',
              numeroDocumento: '30123456',
              sexo: 'F',
              fechaNacimiento: '1990-05-14',
              vinculo: 'Hijo/a',
            },
          ],
        },
      })
      .expect(201);
    expect(res.body.userId).toBe(3);
    // No deben colarse claves con valor undefined: rompería la detección de duplicados.
    expect(Object.keys(res.body.body.cambios).sort()).toEqual([
      'domicilio',
      'familiares',
      'reparticion',
      'telefonos',
    ]);
  });

  it('rechaza campos no permitidos con 400', async () => {
    await request(app.getHttpServer())
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token({ sub: 3, rol: 'EMPLEADO' })}`)
      .send({ cambios: { nombre: 'Carlos' } })
      .expect(400);
  });

  it('un empleado no puede aprobar (403) y RRHH sí (rol numérico 1)', async () => {
    await request(app.getHttpServer())
      .patch('/api/solicitudes/abc/aprobar')
      .set('Authorization', `Bearer ${token({ sub: 3, rol: 2 })}`)
      .send({ observacion: '' })
      .expect(403);
    const res = await request(app.getHttpServer())
      .patch('/api/solicitudes/abc/aprobar')
      .set('Authorization', `Bearer ${token({ sub: 1, rol: 1 })}`)
      .send({ observacion: 'ok' })
      .expect(200);
    expect(res.body.data.aprobadoPor).toBe(1);
  });

  it('solo RRHH puede rechazar y pasa motivo e identidad autenticada', async () => {
    await request(app.getHttpServer())
      .patch('/api/solicitudes/abc/rechazar')
      .set('Authorization', `Bearer ${token({ sub: 3, rol: 2 })}`)
      .send({ motivo: 'Falta documentación' })
      .expect(403);
    const res = await request(app.getHttpServer())
      .patch('/api/solicitudes/abc/rechazar')
      .set('Authorization', `Bearer ${token({ sub: 1, rol: 1 })}`)
      .send({ motivo: 'Falta documentación' })
      .expect(200);
    expect(res.body.data).toMatchObject({
      rechazadoPor: 1,
      motivo: 'Falta documentación',
    });
  });

  it('rechaza motivos vacíos', async () => {
    await request(app.getHttpServer())
      .patch('/api/solicitudes/abc/rechazar')
      .set('Authorization', `Bearer ${token({ sub: 1, rol: 1 })}`)
      .send({ motivo: '   ' })
      .expect(400);
  });
});
