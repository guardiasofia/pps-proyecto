import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { Solicitud } from './entities/solicitud.entity.js';
import { SolicitudesService } from './solicitudes.service.js';

describe('SolicitudesService', () => {
  const crearServicio = (solicitud: Partial<Solicitud> = {}) => {
    const pending: Solicitud = {
      id: 'solicitud-1',
      empleadoId: 1002,
      tipo: 'actualizacion-datos',
      estado: 'pendiente',
      cambios: { estadocivil: 'Casado/a' },
      creadoEn: new Date(),
      ...solicitud,
    };
    const solicitudRepository = {
      create: vi.fn((data) => data),
      save: vi.fn(async (data) => data),
      find: vi.fn(async () => [pending]),
      findOne: vi.fn(async () => pending),
    };
    const empleado = { legajo: 1002, estadocivil: 'Soltero/a' };
    const empleadoRepository = {
      findOne: vi.fn(async () => empleado),
      save: vi.fn(async (data) => data),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity === Solicitud ? solicitudRepository : empleadoRepository,
      ),
      query: vi.fn(async () => []),
    };
    const pendingQuery = vi.fn(async () => [pending]);
    const dataSource = {
      query: vi.fn(async (query: string) => {
        if (query.includes('usuarioslegajos')) return [{ legajo: 1002 }];
        if (query.includes('FROM funciones')) return [];
        return [];
      }),
      transaction: vi.fn(async (callback) => callback(manager)),
    };
    solicitudRepository.find = pendingQuery;
    const service = new SolicitudesService(
      undefined,
      undefined,
      undefined,
      solicitudRepository as any,
      dataSource as any,
    );
    return {
      service,
      solicitudRepository,
      empleado,
      empleadoRepository,
      dataSource,
    };
  };

  it('persiste una solicitud solo con campos permitidos', async () => {
    const { service, solicitudRepository, dataSource } = crearServicio();

    await expect(
      service.create(
        {
          cambios: {
            domicilio: 'Belgrano 456',
            email: 'nuevo@mail.com',
          },
        },
        '3',
      ),
    ).resolves.toMatchObject({ empleadoId: 1002, estado: 'pendiente' });
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('usuarioslegajos'),
      [3],
    );
    expect(solicitudRepository.save).toHaveBeenCalledOnce();
  });

  it('rechaza campos no permitidos antes de acceder a la base', async () => {
    const { service, dataSource } = crearServicio();

    await expect(
      service.create(
        {
          cambios: { nombre: 'Carlos' },
        },
        '1002',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('solo devuelve solicitudes pendientes desde el repositorio', async () => {
    const { service, solicitudRepository } = crearServicio();

    const solicitudes = await service.findAll();

    expect(solicitudes).toHaveLength(1);
    expect(solicitudRepository.find).toHaveBeenCalledWith({
      where: { estado: 'pendiente' },
      order: { creadoEn: 'DESC' },
    });
  });

  it('rechaza correo y teléfono con formato inválido', async () => {
    const { service } = crearServicio();

    await expect(
      service.create({ cambios: { email: 'correo-invalido' } }, '1002'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ cambios: { telefono: 'abc' } }, '1002'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('valida el catálogo de funciones y la relación entre CUD y certificado', async () => {
    const { service } = crearServicio();

    await expect(
      service.create({ cambios: { funcion: 999 } }, '1002'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ cambios: { poseeCud: true } }, '1002'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(
        {
          cambios: {
            poseeCud: false,
            certificadoDiscapacidad: 'data:application/pdf;base64,JVBERi0=',
          },
        },
        '1002',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza solicitar un campo que ya tiene una solicitud pendiente', async () => {
    const { service } = crearServicio({ cambios: { email: 'previo@mail.com' } });

    await expect(
      service.create({ cambios: { email: 'nuevo@mail.com' } }, '3'),
    ).rejects.toThrow('Ya existe una solicitud pendiente para: email');
  });

  it('aplica los cambios del legajo antes de marcar la solicitud aprobada', async () => {
    const { service, empleado, solicitudRepository } = crearServicio({
      cambios: { estadoCivil: 'Casado/a' },
    });

    const result = await service.aprobar('solicitud-1', { aprobadoPor: '1' });

    expect(empleado.estadocivil).toBe('Casado/a');
    expect(result.estado).toBe('aprobada');
    expect(solicitudRepository.save).toHaveBeenCalledOnce();
  });

  it('rechaza una solicitud pendiente sin aplicar cambios y persiste el motivo', async () => {
    const { service, empleado, solicitudRepository } = crearServicio({
      cambios: { estadoCivil: 'Casado/a' },
    });

    const result = await service.rechazar('solicitud-1', {
      rechazadoPor: '1',
      motivo: '  Falta documentación  ',
    });

    expect(result).toMatchObject({
      estado: 'rechazada',
      rechazadoPor: '1',
      motivoRechazo: 'Falta documentación',
    });
    expect(empleado.estadocivil).toBe('Soltero/a');
    expect(solicitudRepository.save).toHaveBeenCalledOnce();
  });

  it('no rechaza una solicitud sin motivo o sin identidad de RRHH', async () => {
    const { service, dataSource } = crearServicio();

    await expect(
      service.rechazar('solicitud-1', {
        rechazadoPor: '1',
        motivo: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.rechazar('solicitud-1', {
        motivo: 'Falta documentación',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('completa crear → aprobar → verificar el estado persistido del legajo', async () => {
    const storedRequests: Solicitud[] = [];
    const storedEmployee = { legajo: 1002, estadocivil: 'Soltero/a' };
    const solicitudRepository = {
      create: vi.fn((data: Solicitud) => data),
      save: vi.fn(async (data: Solicitud) => {
        const existing = storedRequests.findIndex((item) => item.id === data.id);
        if (existing < 0) storedRequests.push(data);
        else storedRequests[existing] = data;
        return data;
      }),
      find: vi.fn(async () => storedRequests.filter((item) => item.estado === 'pendiente')),
      findOne: vi.fn(async ({ where }: { where: { id: string } }) => storedRequests.find((item) => item.id === where.id) ?? null),
    };
    const empleadoRepository = {
      findOne: vi.fn(async () => storedEmployee),
      save: vi.fn(async (data) => Object.assign(storedEmployee, data)),
    };
    const manager = {
      getRepository: vi.fn((entity) => entity === Solicitud ? solicitudRepository : empleadoRepository),
      query: vi.fn(async () => []),
    };
    const dataSource = {
      query: vi.fn(async (query: string) => query.includes('usuarioslegajos') ? [{ legajo: 1002 }] : []),
      transaction: vi.fn(async (callback) => callback(manager)),
    };
    const service = new SolicitudesService(
      undefined,
      undefined,
      undefined,
      solicitudRepository as any,
      dataSource as any,
    );

    const created = await service.create({ cambios: { estadoCivil: 'Casado/a' } }, '3');
    expect(created.estado).toBe('pendiente');
    expect(storedEmployee.estadocivil).toBe('Soltero/a');

    await service.aprobar(created.id, { aprobadoPor: '1' });

    expect(storedRequests[0].estado).toBe('aprobada');
    expect(storedEmployee.estadocivil).toBe('Casado/a');
    expect(await empleadoRepository.findOne()).toMatchObject({ estadocivil: 'Casado/a' });
  });

  it('no aprueba solicitudes sin identidad del aprobador autenticado', async () => {
    const { service, dataSource } = crearServicio();

    await expect(service.aprobar('solicitud-1', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});
