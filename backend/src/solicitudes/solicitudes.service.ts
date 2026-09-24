import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { Archivo } from './entities/archivo.entity.js';
import { EmpCud } from './entities/emp-cud.entity.js';

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
  'poseeCud',
] as const;

const TELEFONO_VALIDO = /^[+]?[(]?\d[\d\s().-]{6,18}\d$/;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOTO_VALIDA = /^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i;
const CERTIFICADO_VALIDO = /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,[a-z0-9+/=]+$/i;
const MAX_ARCHIVO_CODIFICADO = 7_000_000;
const REPARTICIONES_VALIDAS = new Set([
  'CONCEJO DELIBERANTE',
  'JUZGADO DE FALTAS',
  'SECRETARIA DE COORDINACION DE GABINETE Y HACIENDA',
  'SECRETARIA DE DESARROLLO HUMANO',
  'SECRETARIA DE DESARROLLO PRODUCTIVO',
  'SECRETARIA DE GOBIERNO',
  'SECRETARIA DE OBRAS PUBLICAS',
  'SECRETARIA DE SALUD',
  'SECRETARIA DE SERVICIOS PUBLICOS',
]);
const ESTADOS_CIVILES_VALIDOS = new Set([
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Separado/a',
  'Unión convivencial',
]);
const FUNCIONES_VALIDAS = new Set([
  'Administrativo', 'Operario', 'Maestranza', 'Chofer', 'Guardavida', 'Guardaparques',
  'Guía Turístico', 'Inspector', 'Profesional de la Salud', 'Docente', 'Profesional Informático',
  'Profesional en general', 'Técnico en general', 'Personal de Seguridad', 'Cajero', 'Juez',
  'Fiscal', 'Concejal',
]);

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Empleado)
    @Optional() private readonly empleadoRepository?: Repository<Empleado>,
    @InjectRepository(Archivo)
    @Optional() private readonly archivoRepository?: Repository<Archivo>,
    @InjectRepository(EmpCud)
    @Optional() private readonly empCudRepository?: Repository<EmpCud>,
  ) {}

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

    if (camposEnviados.length === 0) {
      throw new BadRequestException('La solicitud debe incluir al menos un cambio');
    }

    this.validarCambios(cambios);

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

  private validarCambios(cambios: Record<string, unknown>) {
    if (typeof cambios.domicilio === 'string' && (cambios.domicilio.trim().length < 5 || cambios.domicilio.length > 255)) {
      throw new BadRequestException('El domicilio debe tener entre 5 y 255 caracteres');
    }

    for (const campo of ['telefono', 'telefonos']) {
      const valor = cambios[campo];
      if (valor === undefined) continue;
      const telefonos = campo === 'telefonos' ? valor : [valor];
      if (!Array.isArray(telefonos) || telefonos.some((telefono) => typeof telefono !== 'string' || !TELEFONO_VALIDO.test(telefono))) {
        throw new BadRequestException('El teléfono no tiene un formato válido');
      }
    }

    for (const campo of ['email', 'correoElectronico']) {
      const valor = cambios[campo];
      if (valor !== undefined && (typeof valor !== 'string' || !EMAIL_VALIDO.test(valor))) {
        throw new BadRequestException('El correo electrónico no tiene un formato válido');
      }
    }

    if (cambios.reparticion !== undefined && !REPARTICIONES_VALIDAS.has(String(cambios.reparticion))) {
      throw new BadRequestException('La repartición seleccionada no es válida');
    }

    if (cambios.estadoCivil !== undefined && !ESTADOS_CIVILES_VALIDOS.has(String(cambios.estadoCivil))) {
      throw new BadRequestException('El estado civil seleccionado no es válido');
    }

    if (cambios.funcion !== undefined && !FUNCIONES_VALIDAS.has(String(cambios.funcion))) {
      throw new BadRequestException('La función seleccionada no es válida');
    }

    if (cambios.poseeCud !== undefined && typeof cambios.poseeCud !== 'boolean') {
      throw new BadRequestException('poseeCud debe ser Sí o No');
    }

    if (cambios.poseeCud === true && cambios.certificadoDiscapacidad === undefined) {
      throw new BadRequestException('Debés adjuntar el certificado de discapacidad');
    }

    if (cambios.poseeCud === false && cambios.certificadoDiscapacidad !== undefined) {
      throw new BadRequestException('No corresponde adjuntar un certificado si poseeCud es No');
    }

    for (const campo of ['foto', 'certificadoDiscapacidad']) {
      const valor = cambios[campo];
      const patron = campo === 'foto' ? FOTO_VALIDA : CERTIFICADO_VALIDO;
      if (valor !== undefined && (typeof valor !== 'string' || valor.length > MAX_ARCHIVO_CODIFICADO || !patron.test(valor))) {
        throw new BadRequestException(`${campo} debe ser un archivo válido`);
      }
    }

    if (cambios.familiares !== undefined) {
      const familiares = cambios.familiares;
      if (!Array.isArray(familiares) || familiares.length === 0 || familiares.some((familiar) => {
        if (!familiar || typeof familiar !== 'object') return true;
        const item = familiar as Record<string, unknown>;
        return typeof item.nombre !== 'string' || !item.nombre.trim() || typeof item.vinculo !== 'string' || !item.vinculo.trim() || (item.telefono !== undefined && (typeof item.telefono !== 'string' || !TELEFONO_VALIDO.test(item.telefono)));
      })) {
        throw new BadRequestException('Cada familiar debe incluir nombre, vínculo y un teléfono válido opcional');
      }
    }
  }

  async aprobar(id: string, data: any) {
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

    try {
      await this.persistirArchivosSiCorresponde(solicitud);
    } catch (error) {
      solicitud.estado = 'pendiente';
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('No se pudo guardar el archivo del empleado');
    }

    return solicitud;
  }

  private async persistirArchivosSiCorresponde(solicitud: any) {
    const foto = solicitud.cambios?.foto;
    const certificado = solicitud.cambios?.certificadoDiscapacidad;
    const poseeCud = solicitud.cambios?.poseeCud;
    if (!foto && !certificado && poseeCud !== false) return;
    if ((foto || certificado) && (!this.archivoRepository || !this.empleadoRepository)) {
      throw new BadRequestException('La persistencia de archivos no está disponible');
    }

    if (poseeCud === false) {
      if (!this.empCudRepository) throw new BadRequestException('La persistencia de CUD no está disponible');
      const cud = await this.empCudRepository.findOne({ where: { legajo: Number(solicitud.legajo), estado: 'AC' } });
      if (cud) {
        cud.estado = 'BA';
        cud.fechaMod = new Date();
        cud.usuarioMod = Number(solicitud.aprobadoPor) || undefined;
        await this.empCudRepository.save(cud);
      }
    }

    if (foto) {
      const empleadoRepository = this.empleadoRepository;
      if (!empleadoRepository) throw new BadRequestException('La persistencia de empleados no está disponible');
      const archivo = await this.guardarArchivo(foto, `foto-empleado-${solicitud.legajo}`);
      const empleado = await empleadoRepository.findOne({ where: { legajo: Number(solicitud.legajo) } });
      if (!empleado) throw new NotFoundException(`Empleado con legajo ${solicitud.legajo} no encontrado`);
      empleado.idarchivofoto = archivo.idArchivo;
      await empleadoRepository.save(empleado);
    }

    if (certificado) {
      if (!this.empCudRepository) throw new BadRequestException('La persistencia de certificados no está disponible');
      const archivo = await this.guardarArchivo(certificado, `certificado-discapacidad-${solicitud.legajo}`);
      const legajo = Number(solicitud.legajo);
      const cud = await this.empCudRepository.findOne({ where: { legajo } });
      if (cud) {
        cud.idArchivo = archivo.idArchivo;
        cud.fechaMod = new Date();
        cud.usuarioMod = Number(solicitud.aprobadoPor) || undefined;
        cud.estado = 'AC';
        await this.empCudRepository.save(cud);
      } else {
        const ultimoCud = await this.empCudRepository
          .createQueryBuilder('cud')
          .select('MAX(cud.idCud)', 'max')
          .getRawOne<{ max: string | null }>();
        await this.empCudRepository.save(this.empCudRepository.create({
          idCud: Number(ultimoCud?.max ?? 0) + 1,
          legajo,
          fechaEmision: new Date(),
          idArchivo: archivo.idArchivo,
          estado: 'AC',
          fechaMod: new Date(),
          usuarioMod: Number(solicitud.aprobadoPor) || undefined,
        }));
      }
    }
  }

  private async guardarArchivo(dataUrl: string, nombreBase: string) {
    const match = /^data:((?:image\/(?:jpeg|jpg|png|webp))|application\/pdf);base64,([a-z0-9+/=]+)$/i.exec(dataUrl);
    if (!match) throw new BadRequestException('El archivo no tiene un formato válido');

    const [, tipoArchivo, contenidoBase64] = match;
    const extension = tipoArchivo === 'application/pdf' ? 'pdf' : tipoArchivo.split('/')[1] === 'jpeg' ? 'jpg' : tipoArchivo.split('/')[1];
    const ultimoArchivo = await this.archivoRepository!
      .createQueryBuilder('archivo')
      .select('MAX(archivo.idArchivo)', 'max')
      .getRawOne<{ max: string | null }>();
    const archivo = this.archivoRepository!.create({
      idArchivo: Number(ultimoArchivo?.max ?? 0) + 1,
      contenido: Buffer.from(contenidoBase64, 'base64'),
      tipoArchivo,
      nombreArchivo: `${nombreBase}.${extension}`,
      fechaCarga: new Date(),
      estado: 'AC',
      fechaMod: new Date(),
    });
    return this.archivoRepository!.save(archivo);
  }
}
