import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { Archivo } from './entities/archivo.entity.js';
import { EmpCud } from './entities/emp-cud.entity.js';
import { Solicitud } from './entities/solicitud.entity.js';

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
const CERTIFICADO_VALIDO =
  /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,[a-z0-9+/=]+$/i;
const MAX_ARCHIVO_CODIFICADO = 7_000_000;
const ESTADOS_CIVILES_VALIDOS = new Set([
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Separado/a',
  'Unión convivencial',
]);

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Empleado)
    @Optional()
    private readonly empleadoRepository?: Repository<Empleado>,
    @InjectRepository(Archivo)
    @Optional()
    private readonly archivoRepository?: Repository<Archivo>,
    @InjectRepository(EmpCud)
    @Optional()
    private readonly empCudRepository?: Repository<EmpCud>,
    @InjectRepository(Solicitud)
    @Optional()
    private readonly solicitudRepository?: Repository<Solicitud>,
    @InjectDataSource()
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async findAll(estado = 'pendiente') {
    if (!this.solicitudRepository)
      throw new BadRequestException(
        'La persistencia de solicitudes no está disponible',
      );
    const solicitudes = await this.solicitudRepository.find({
      where: estado === 'all' ? undefined : { estado },
      order: { creadoEn: 'DESC' },
    });
    const legajos = [...new Set(solicitudes.map((solicitud) => solicitud.empleadoId))];
    if (!legajos.length) return [];

    const empleados = this.dataSource
      ? await this.dataSource.query(
          'SELECT legajo, nombres, apellido, estado FROM empleados WHERE legajo = ANY($1::int[])',
          [legajos],
        ) as Array<{ legajo: number; nombres?: string; apellido?: string; estado?: string }>
      : [];
    const funcionIds = solicitudes
      .map((solicitud) => solicitud.cambios?.funcion)
      .filter((id): id is number => typeof id === 'number');
    const reparticionIds = solicitudes
      .map((solicitud) => solicitud.cambios?.reparticion)
      .filter((id): id is number => typeof id === 'number');
    const funciones = this.dataSource && funcionIds.length
      ? await this.dataSource.query('SELECT idfuncion, funcion FROM funciones WHERE idfuncion = ANY($1::int[])', [funcionIds]) as Array<{ idfuncion: number; funcion: string }>
      : [];
    const reparticiones = this.dataSource && reparticionIds.length
      ? await this.dataSource.query('SELECT idreparticion, nombre FROM reparticiones WHERE idreparticion = ANY($1::int[])', [reparticionIds]) as Array<{ idreparticion: number; nombre: string }>
      : [];
    const empleadosPorLegajo = new Map(
      empleados.map((empleado) => [empleado.legajo, `${empleado.nombres ?? ''} ${empleado.apellido ?? ''}`.trim()]),
    );
    const funcionesPorId = new Map(funciones.map((funcion) => [funcion.idfuncion, funcion.funcion]));
    const reparticionesPorId = new Map(reparticiones.map((reparticion) => [reparticion.idreparticion, reparticion.nombre]));
    return solicitudes.map((solicitud) => ({
      ...solicitud,
      empleadoNombre: empleadosPorLegajo.get(solicitud.empleadoId) ?? 'Nombre no disponible',
      empleadoActivo: empleados.find((empleado) => empleado.legajo === solicitud.empleadoId)?.estado === 'AC',
      catalogosSolicitados: {
        funcion: funcionesPorId.get(Number(solicitud.cambios?.funcion)),
        reparticion: reparticionesPorId.get(Number(solicitud.cambios?.reparticion)),
      },
    }));
  }

  async findCatalogos() {
    if (!this.dataSource)
      throw new BadRequestException('Los catálogos no están disponibles');
    const [reparticiones, funciones, parentescos] = await Promise.all([
      this.dataSource.query(
        `SELECT idreparticion AS id, nombre FROM reparticiones WHERE estado = 'AC' ORDER BY nombre`,
      ),
      this.dataSource.query(
        `SELECT idfuncion AS id, funcion AS nombre FROM funciones ORDER BY funcion`,
      ),
      this.dataSource.query(
        `SELECT parentesco AS nombre FROM parentesco ORDER BY parentesco`,
      ),
    ]);
    return {
      reparticiones,
      funciones,
      parentescos: parentescos.map((item: { nombre: string }) => item.nombre),
      estadosCiviles: [...ESTADOS_CIVILES_VALIDOS],
    };
  }

  async findOne(id: string) {
    if (!this.solicitudRepository)
      throw new BadRequestException(
        'La persistencia de solicitudes no está disponible',
      );
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }

    return solicitud;
  }

  async findReportData(id: string) {
    const solicitud = await this.findOne(id);
    const empleado = this.empleadoRepository
      ? await this.empleadoRepository.findOne({
          where: { legajo: solicitud.empleadoId },
          relations: { funcion: true, reparticion: true },
        })
      : null;
    const [direccion] = this.dataSource
      ? await this.dataSource.query(
          `SELECT calle, callenro, barrio, ciudad, provincia, tel1, tel2, email FROM direcciones WHERE legajo = $1 AND estado = 'AC' LIMIT 1`,
          [solicitud.empleadoId],
        )
      : [];
    const foto =
      empleado?.idarchivofoto && this.dataSource
        ? await this.dataSource.query(
            'SELECT contenido, tipoarchivo FROM archivos WHERE idarchivo = $1',
            [empleado.idarchivofoto],
          )
        : [];
    const [funcionSolicitada] =
      typeof solicitud.cambios?.funcion === 'number' && this.dataSource
        ? await this.dataSource.query(
            'SELECT funcion FROM funciones WHERE idfuncion = $1',
            [solicitud.cambios.funcion],
          )
        : [];
    const [reparticionSolicitada] =
      typeof solicitud.cambios?.reparticion === 'number' && this.dataSource
        ? await this.dataSource.query(
            'SELECT nombre FROM reparticiones WHERE idreparticion = $1',
            [solicitud.cambios.reparticion],
          )
        : [];
    return {
      solicitud,
      catalogosSolicitados: {
        funcion: funcionSolicitada?.funcion,
        reparticion: reparticionSolicitada?.nombre,
      },
      empleado,
      direccion: direccion ?? null,
      foto: foto[0] ?? null,
    };
  }

  async create(data: any, userId: string | number | null) {
    if (userId === null || userId === undefined || userId === '') {
      throw new UnauthorizedException(
        'El token no contiene la identidad del usuario',
      );
    }

    const codigoUsuario = Number(userId);
    if (!Number.isSafeInteger(codigoUsuario) || codigoUsuario <= 0) {
      throw new UnauthorizedException(
        'El token no contiene un identificador de usuario válido',
      );
    }
    const cambios = data?.cambios ?? {};
    const camposEnviados = Object.keys(cambios);
    const camposInvalidos = camposEnviados.filter(
      (campo) =>
        !CAMPOS_PERMITIDOS.includes(
          campo as (typeof CAMPOS_PERMITIDOS)[number],
        ),
    );

    if (camposInvalidos.length > 0) {
      throw new BadRequestException(
        `Los siguientes campos no están permitidos para actualización: ${camposInvalidos.join(', ')}`,
      );
    }

    if (camposEnviados.length === 0) {
      throw new BadRequestException(
        'La solicitud debe incluir al menos un cambio',
      );
    }

    this.validarCambios(cambios);
    this.validarContenidoArchivos(cambios);
    if (!this.dataSource || !this.solicitudRepository) {
      throw new BadRequestException(
        'La persistencia de solicitudes no está disponible',
      );
    }
    const vinculaciones = (await this.dataSource.query(
      `SELECT legajo FROM usuarioslegajos WHERE usucodigo = $1 AND estado = 'AC' LIMIT 1`,
      [codigoUsuario],
    )) as Array<{ legajo: number }>;
    const legajo = vinculaciones[0]?.legajo;
    if (!legajo)
      throw new NotFoundException('El usuario no tiene un legajo asociado');
    await this.validarCatalogos(cambios);
    const valoresAnteriores = await this.leerValoresActuales(legajo, cambios);
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [legajo]);
      const repository = manager.getRepository(Solicitud);
      const pendientes = await repository.find({
        where: { empleadoId: legajo, estado: 'pendiente' },
      });
      const camposOcupados = new Set(
        pendientes.flatMap((solicitud) => Object.keys(solicitud.cambios ?? {})),
      );
      const camposDuplicados = Object.keys(cambios).filter((field) =>
        [...camposOcupados].some((ocupado) =>
          ocupado === field ||
          (field === 'familiares' && ocupado === 'familiares') ||
          (field === 'email' && ocupado === 'correoElectronico') ||
          (field === 'correoElectronico' && ocupado === 'email') ||
          (field === 'telefono' && ocupado === 'telefonos') ||
          (field === 'telefonos' && ocupado === 'telefono'),
        ),
      );
      if (camposDuplicados.length) {
        throw new BadRequestException(
          `Ya existe una solicitud pendiente para: ${camposDuplicados.join(', ')}`,
        );
      }
      const solicitud = repository.create({
        id: randomUUID(),
        empleadoId: legajo,
        tipo: 'actualizacion-datos',
        estado: 'pendiente',
        cambios,
        valoresAnteriores,
        creadoEn: new Date(),
      });
      return repository.save(solicitud);
    });
  }

  private async validarCatalogos(cambios: Record<string, unknown>) {
    if (!this.dataSource) return;
    if (typeof cambios.reparticion === 'number') {
      const [reparticion] = await this.dataSource.query(
        `SELECT 1 FROM reparticiones WHERE estado = 'AC' AND idreparticion = $1 LIMIT 1`,
        [cambios.reparticion],
      );
      if (!reparticion)
        throw new BadRequestException('La repartición seleccionada no existe o está inactiva');
    }
    if (typeof cambios.funcion === 'number') {
      const [funcion] = await this.dataSource.query(
        `SELECT 1 FROM funciones WHERE idfuncion = $1 LIMIT 1`,
        [cambios.funcion],
      );
      if (!funcion)
        throw new BadRequestException('La función seleccionada no existe');
    }
    if (Array.isArray(cambios.familiares)) {
      const vinculos = [...new Set((cambios.familiares as Array<Record<string, unknown>>)
        .map((familiar) => familiar.vinculo).filter((value): value is string => typeof value === 'string'))];
      if (vinculos.length) {
        const encontrados = await this.dataSource.query(
          'SELECT parentesco FROM parentesco WHERE parentesco = ANY($1::varchar[])',
          [vinculos],
        ) as Array<{ parentesco: string }>;
        const validos = new Set(encontrados.map((row) => row.parentesco));
        const invalidos = vinculos.filter((vinculo) => !validos.has(vinculo));
        if (invalidos.length)
          throw new BadRequestException(`Vínculo familiar no válido: ${invalidos.join(', ')}`);
      }
    }
  }

  private async leerValoresActuales(
    legajo: number,
    cambios: Record<string, unknown>,
  ) {
    if (!this.dataSource) return {};
    const [empleado] = (await this.dataSource.query(
      `SELECT e.estadocivil, f.funcion AS funcion_nombre, r.nombre AS reparticion_nombre, e.idarchivofoto
       FROM empleados e
       LEFT JOIN funciones f ON f.idfuncion = e.idfuncion
       LEFT JOIN reparticiones r ON r.idreparticion = e.idreparticion
       WHERE e.legajo = $1`,
      [legajo],
    )) as Array<Record<string, unknown>>;
    const [direccion] = (await this.dataSource.query(
      `SELECT calle, callenro, barrio, ciudad, provincia, tel1, tel2, email
       FROM direcciones WHERE legajo = $1 AND estado = 'AC' LIMIT 1`,
      [legajo],
    )) as Array<Record<string, unknown>>;
    const anteriores: Record<string, unknown> = {};
    for (const field of Object.keys(cambios)) {
      switch (field) {
        case 'domicilio':
          anteriores[field] =
            [
              direccion?.calle,
              direccion?.callenro,
              direccion?.barrio,
              direccion?.ciudad,
              direccion?.provincia,
            ]
              .filter(Boolean)
              .join(' ') || 'Sin informar';
          break;
        case 'telefono':
          anteriores[field] = direccion?.tel1 ?? 'Sin informar';
          break;
        case 'telefonos':
          anteriores[field] = [direccion?.tel1, direccion?.tel2].filter(Boolean);
          break;
        case 'email':
        case 'correoElectronico':
          anteriores[field] = direccion?.email ?? 'Sin informar';
          break;
        case 'estadoCivil':
          anteriores[field] = empleado?.estadocivil ?? 'Sin informar';
          break;
        case 'funcion':
          anteriores[field] = empleado?.funcion_nombre ?? 'Sin informar';
          break;
        case 'reparticion':
          anteriores[field] = empleado?.reparticion_nombre ?? 'Sin informar';
          break;
        case 'familiares':
          anteriores[field] = await this.dataSource.query(
            `SELECT apellido AS apellidos, nombres, tipo_documento AS "tipoDocumento", numero_documento AS "numeroDocumento", sexo, fecha_nacimiento AS "fechaNacimiento", parentesco AS vinculo, telefono, discapacitado
             FROM familiares WHERE legajo = $1 AND estado = 'AC' ORDER BY numfamiliar`,
            [legajo],
          );
          break;
        case 'poseeCud':
          anteriores[field] = Boolean(
            (
              await this.dataSource.query(
                `SELECT 1 FROM emp_cud WHERE legajo = $1 AND estado = 'AC' LIMIT 1`,
                [legajo],
              )
            ).length,
          );
          break;
        case 'foto':
          anteriores[field] = empleado?.idarchivofoto
            ? 'Foto registrada'
            : 'Sin foto';
          break;
        case 'certificadoDiscapacidad':
          anteriores[field] = 'Ver certificado vigente';
          break;
        default:
          anteriores[field] = 'Sin informar';
      }
    }
    return anteriores;
  }

  private validarCambios(cambios: Record<string, unknown>) {
    if (
      typeof cambios.domicilio === 'string' &&
      (cambios.domicilio.trim().length < 5 || cambios.domicilio.length > 255)
    ) {
      throw new BadRequestException(
        'El domicilio debe tener entre 5 y 255 caracteres',
      );
    }

    for (const campo of ['telefono', 'telefonos']) {
      const valor = cambios[campo];
      if (valor === undefined) continue;
      const telefonos = campo === 'telefonos' ? valor : [valor];
      if (
        !Array.isArray(telefonos) ||
        telefonos.some(
          (telefono) =>
            typeof telefono !== 'string' || !TELEFONO_VALIDO.test(telefono),
        )
      ) {
        throw new BadRequestException('El teléfono no tiene un formato válido');
      }
    }

    for (const campo of ['email', 'correoElectronico']) {
      const valor = cambios[campo];
      if (
        valor !== undefined &&
        (typeof valor !== 'string' || !EMAIL_VALIDO.test(valor))
      ) {
        throw new BadRequestException(
          'El correo electrónico no tiene un formato válido',
        );
      }
    }

    if (
      cambios.estadoCivil !== undefined &&
      !ESTADOS_CIVILES_VALIDOS.has(String(cambios.estadoCivil))
    ) {
      throw new BadRequestException(
        'El estado civil seleccionado no es válido',
      );
    }

    if (
      cambios.poseeCud !== undefined &&
      typeof cambios.poseeCud !== 'boolean'
    ) {
      throw new BadRequestException('poseeCud debe ser Sí o No');
    }

    if (
      cambios.poseeCud === true &&
      cambios.certificadoDiscapacidad === undefined
    ) {
      throw new BadRequestException(
        'Debés adjuntar el certificado de discapacidad',
      );
    }

    if (
      cambios.poseeCud === false &&
      cambios.certificadoDiscapacidad !== undefined
    ) {
      throw new BadRequestException(
        'No corresponde adjuntar un certificado si poseeCud es No',
      );
    }

    for (const campo of ['foto', 'certificadoDiscapacidad']) {
      const valor = cambios[campo];
      const patron = campo === 'foto' ? FOTO_VALIDA : CERTIFICADO_VALIDO;
      if (
        valor !== undefined &&
        (typeof valor !== 'string' ||
          valor.length > MAX_ARCHIVO_CODIFICADO ||
          !patron.test(valor))
      ) {
        throw new BadRequestException(`${campo} debe ser un archivo válido`);
      }
    }

    if (cambios.familiares !== undefined) {
      const familiares = cambios.familiares;
      if (
        !Array.isArray(familiares) ||
        familiares.length === 0 ||
        familiares.some((familiar) => {
          if (!familiar || typeof familiar !== 'object') return true;
          const item = familiar as Record<string, unknown>;
          return (
            typeof item.apellidos !== 'string' ||
            !item.apellidos.trim() ||
            typeof item.nombres !== 'string' ||
            !item.nombres.trim() ||
            typeof item.tipoDocumento !== 'string' ||
            !['DNI', 'LC', 'LE', 'CI', 'Pasaporte'].includes(String(item.tipoDocumento)) ||
            typeof item.numeroDocumento !== 'string' ||
            !/^[A-Za-z0-9.-]{3,20}$/.test(String(item.numeroDocumento)) ||
            typeof item.sexo !== 'string' ||
            !['F', 'M', 'X'].includes(String(item.sexo)) ||
            typeof item.fechaNacimiento !== 'string' ||
            Number.isNaN(Date.parse(String(item.fechaNacimiento))) ||
            typeof item.vinculo !== 'string' ||
            !item.vinculo.trim() ||
            (item.telefono !== undefined &&
              (typeof item.telefono !== 'string' ||
                !TELEFONO_VALIDO.test(item.telefono)))
          );
        })
      ) {
        throw new BadRequestException(
          'Cada familiar debe incluir apellidos, nombres, tipo y número de documento, sexo, fecha de nacimiento y parentesco; el teléfono es opcional y debe ser válido',
        );
      }
    }
  }

  private validarContenidoArchivos(cambios: Record<string, unknown>) {
    for (const campo of ['foto', 'certificadoDiscapacidad']) {
      const value = cambios[campo];
      if (typeof value !== 'string') continue;
      const match = /^data:([^;]+);base64,([a-z0-9+/=]+)$/i.exec(value);
      if (!match) throw new BadRequestException(`${campo} debe ser un archivo válido`);
      const [, mime, encoded] = match;
      const bytes = Buffer.from(encoded, 'base64');
      const png = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const webp = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
      const pdf = bytes.length >= 5 && bytes.toString('ascii', 0, 5) === '%PDF-';
      const valid = mime === 'image/png' ? png
        : mime === 'image/jpeg' || mime === 'image/jpg' ? jpeg
          : mime === 'image/webp' ? webp
            : mime === 'application/pdf' ? pdf
              : false;
      if (!valid) throw new BadRequestException(`${campo} no coincide con el formato declarado`);
      if (bytes.length > 5 * 1024 * 1024) throw new BadRequestException(`${campo} supera el máximo de 5 MB`);
    }
  }

  async aprobar(id: string, data: any) {
    if (!this.dataSource)
      throw new BadRequestException(
        'La persistencia de solicitudes no está disponible',
      );
    if (
      data?.aprobadoPor === null ||
      data?.aprobadoPor === undefined ||
      data?.aprobadoPor === ''
    ) {
      throw new UnauthorizedException(
        'El token no contiene la identidad del aprobador',
      );
    }
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(Solicitud);
        const solicitud = await repository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!solicitud)
          throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
        if (solicitud.estado !== 'pendiente') {
          throw new BadRequestException(
            `La solicitud ${id} ya no está pendiente`,
          );
        }

        solicitud.aprobadoPor = String(data.aprobadoPor);
        await this.aplicarCambios(manager, solicitud);
        solicitud.estado = 'aprobada';
        solicitud.observacion = data?.observacion ?? '';
        solicitud.aprobadoEn = new Date();
        return repository.save(solicitud);
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new BadRequestException(
        'No se pudieron aplicar los cambios al legajo',
      );
    }
  }

  private async aplicarCambios(manager: EntityManager, solicitud: Solicitud) {
    const legajo = solicitud.empleadoId;
    const empleadoRepository = manager.getRepository(Empleado);
    const empleado = await empleadoRepository.findOne({ where: { legajo } });
    if (!empleado)
      throw new NotFoundException(
        `Empleado con legajo ${legajo} no encontrado`,
      );

    const cambios = solicitud.cambios;
    const actualizadoPor = Number(solicitud.aprobadoPor) || undefined;
    if (typeof cambios.estadoCivil === 'string')
      empleado.estadocivil = cambios.estadoCivil;
    if (typeof cambios.funcion === 'number') {
      empleado.idfuncion = cambios.funcion;
    }
    if (typeof cambios.reparticion === 'number') {
      empleado.idreparticion = cambios.reparticion;
    }
    empleado.fechamod = new Date();
    empleado.usuariomod = actualizadoPor;
    await empleadoRepository.save(empleado);

    const direccion: Record<string, unknown> = {};
    if (typeof cambios.domicilio === 'string')
      direccion.calle = cambios.domicilio;
    if (typeof cambios.telefono === 'string') direccion.tel1 = cambios.telefono;
    if (Array.isArray(cambios.telefonos)) {
      direccion.tel1 = cambios.telefonos[0] ?? null;
      direccion.tel2 = cambios.telefonos[1] ?? null;
    }
    const email = cambios.correoElectronico ?? cambios.email;
    if (typeof email === 'string') direccion.email = email;
    if (Object.keys(direccion).length > 0) {
      const columnas = Object.keys(direccion);
      const valores = Object.values(direccion);
      await manager.query(
        `INSERT INTO direcciones (legajo, ${columnas.join(', ')}, f_actualiz, estado, fechamod, usuariomod)
         VALUES ($1, ${valores.map((_, index) => `$${index + 2}`).join(', ')}, CURRENT_DATE, 'AC', CURRENT_TIMESTAMP, $${valores.length + 2})
         ON CONFLICT (legajo) DO UPDATE SET ${columnas.map((columna) => `${columna} = EXCLUDED.${columna}`).join(', ')}, f_actualiz = CURRENT_DATE, estado = 'AC', fechamod = CURRENT_TIMESTAMP, usuariomod = EXCLUDED.usuariomod`,
        [legajo, ...valores, actualizadoPor ?? null],
      );
    }

    if (Array.isArray(cambios.familiares)) {
      const maximo = (await manager.query(
        'SELECT COALESCE(MAX(numfamiliar), 0) AS max FROM familiares WHERE legajo = $1',
        [legajo],
      )) as Array<{ max: number }>;
      let numfamiliar = Number(maximo[0]?.max ?? 0) + 1;
      for (const familiar of cambios.familiares as Array<
        Record<string, unknown>
      >) {
        await manager.query(
          `INSERT INTO familiares (legajo, numfamiliar, apellido, nombres, parentesco, discapacitado, telefono, tipo_documento, numero_documento, sexo, fecha_nacimiento, estado, fechamod, usuariomod)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'AC', CURRENT_TIMESTAMP, $12)`,
          [
            legajo,
            numfamiliar++,
            familiar.apellidos,
            familiar.nombres,
            familiar.vinculo,
            familiar.discapacitado ?? false,
            familiar.telefono ?? null,
            familiar.tipoDocumento,
            familiar.numeroDocumento,
            familiar.sexo,
            familiar.fechaNacimiento,
            actualizadoPor ?? null,
          ],
        );
      }
    }

    await this.persistirArchivosSiCorresponde(manager, solicitud);
  }

  private async persistirArchivosSiCorresponde(
    manager: EntityManager,
    solicitud: Solicitud,
  ) {
    const foto = solicitud.cambios?.foto;
    const certificado = solicitud.cambios?.certificadoDiscapacidad;
    const poseeCud = solicitud.cambios?.poseeCud;
    if (!foto && !certificado && poseeCud !== false) return;
    if ((foto || certificado) && !this.archivoRepository) {
      throw new BadRequestException(
        'La persistencia de archivos no está disponible',
      );
    }

    if (poseeCud === false) {
      const repository = manager.getRepository(EmpCud);
      const cud = await repository.findOne({
        where: { legajo: solicitud.empleadoId, estado: 'AC' },
      });
      if (cud) {
        cud.estado = 'BA';
        cud.fechaMod = new Date();
        cud.usuarioMod = Number(solicitud.aprobadoPor) || undefined;
        await repository.save(cud);
      }
    }

    if (typeof foto === 'string') {
      const empleadoRepository = manager.getRepository(Empleado);
      const archivo = await this.guardarArchivo(
        foto,
        `foto-empleado-${solicitud.empleadoId}`,
        manager,
      );
      const empleado = await empleadoRepository.findOne({
        where: { legajo: solicitud.empleadoId },
      });
      if (!empleado)
        throw new NotFoundException(
          `Empleado con legajo ${solicitud.empleadoId} no encontrado`,
        );
      empleado.idarchivofoto = archivo.idArchivo;
      await empleadoRepository.save(empleado);
    }

    if (typeof certificado === 'string') {
      const repository = manager.getRepository(EmpCud);
      const archivo = await this.guardarArchivo(
        certificado,
        `certificado-discapacidad-${solicitud.empleadoId}`,
        manager,
      );
      const legajo = solicitud.empleadoId;
      const cud = await repository.findOne({ where: { legajo } });
      if (cud) {
        cud.idArchivo = archivo.idArchivo;
        cud.fechaMod = new Date();
        cud.usuarioMod = Number(solicitud.aprobadoPor) || undefined;
        cud.estado = 'AC';
        await repository.save(cud);
      } else {
        const ultimoCud = await repository
          .createQueryBuilder('cud')
          .select('MAX(cud.idCud)', 'max')
          .getRawOne<{ max: string | null }>();
        await repository.save(
          repository.create({
            idCud: Number(ultimoCud?.max ?? 0) + 1,
            legajo,
            fechaEmision: new Date(),
            idArchivo: archivo.idArchivo,
            estado: 'AC',
            fechaMod: new Date(),
            usuarioMod: Number(solicitud.aprobadoPor) || undefined,
          }),
        );
      }
    }
  }

  private async guardarArchivo(
    dataUrl: string,
    nombreBase: string,
    manager: EntityManager,
  ) {
    const match =
      /^data:((?:image\/(?:jpeg|jpg|png|webp))|application\/pdf);base64,([a-z0-9+/=]+)$/i.exec(
        dataUrl,
      );
    if (!match)
      throw new BadRequestException('El archivo no tiene un formato válido');

    const [, tipoArchivo, contenidoBase64] = match;
    const extension =
      tipoArchivo === 'application/pdf'
        ? 'pdf'
        : tipoArchivo.split('/')[1] === 'jpeg'
          ? 'jpg'
          : tipoArchivo.split('/')[1];
    const repository = manager.getRepository(Archivo);
    const ultimoArchivo = await repository
      .createQueryBuilder('archivo')
      .select('MAX(archivo.idArchivo)', 'max')
      .getRawOne<{ max: string | null }>();
    const archivo = repository.create({
      idArchivo: Number(ultimoArchivo?.max ?? 0) + 1,
      contenido: Buffer.from(contenidoBase64, 'base64'),
      tipoArchivo,
      nombreArchivo: `${nombreBase}.${extension}`,
      fechaCarga: new Date(),
      estado: 'AC',
      fechaMod: new Date(),
    });
    return repository.save(archivo);
  }
}
