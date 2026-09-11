import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const CAMPOS_PERMITIDOS = [
  'domicilio',
  'telefono',
  'telefonos',
  'correoElectronico',
  'email',
  'reparticion',
  'estadoCivil',
  'familiares',
  'foto',
  'certificadoDiscapacidad',
  'funcion',
] as const;

@Injectable()
export class SolicitudesService {
  private solicitudes: any[] = [
    {
      id: '1',
      empleadoId: '1001',
      legajo: '1001',
      estado: 'pendiente',
      tipo: 'actualizacion-datos',
      cambios: {
        domicilio: 'San Martín 123',
        telefono: '3511234567',
        email: 'ana@gmail.com',
        reparticion: 'Recursos Humanos',
        estadoCivil: 'Soltera',
      },
    },
  ];

  findAll() {
    return this.solicitudes.filter((solicitud) => solicitud.estado === 'pendiente');
  }

  findOne(id: string) {
    const solicitud = this.solicitudes.find((item) => item.id === id);

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }

    return solicitud;
  }

  create(data: any, userId: string | number | null) {
    if (userId === null || userId === undefined || userId === '') {
      throw new UnauthorizedException('El token no contiene la identidad del usuario');
    }

    const cambios = data?.cambios ?? {};
    const camposEnviados = Object.keys(cambios);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !CAMPOS_PERMITIDOS.includes(campo as (typeof CAMPOS_PERMITIDOS)[number]),
    );

    if (camposInvalidos.length > 0) {
      throw new BadRequestException(
        `Los siguientes campos no están permitidos para actualización: ${camposInvalidos.join(', ')}`,
      );
    }

    const solicitud = {
      id: String(Date.now()),
      empleadoId: String(userId),
      legajo: String(userId),
      tipo: 'actualizacion-datos',
      estado: 'pendiente',
      cambios,
      creadoEn: new Date().toISOString(),
    };

    this.solicitudes.push(solicitud);
    return solicitud;
  }

  aprobar(id: string, data: any) {
    const solicitud = this.findOne(id);

    if (solicitud.estado === 'aprobada') {
      throw new BadRequestException(`La solicitud ${id} ya fue aprobada`);
    }

    const autorizadoPor = data?.aprobadoPor ?? data?.usuario ?? 'rrhh-admin';
    const observacion = data?.observacion ?? '';

    solicitud.estado = 'aprobada';
    solicitud.aprobadoPor = autorizadoPor;
    solicitud.observacion = observacion;
    solicitud.aprobadoEn = new Date().toISOString();

    return solicitud;
  }
}
