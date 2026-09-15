import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  MinLength,
  MaxLength,
  IsString,
  ValidateNested,
} from 'class-validator';

const REPARTICIONES = [
  'CONCEJO DELIBERANTE',
  'JUZGADO DE FALTAS',
  'SECRETARIA DE COORDINACION DE GABINETE Y HACIENDA',
  'SECRETARIA DE DESARROLLO HUMANO',
  'SECRETARIA DE DESARROLLO PRODUCTIVO',
  'SECRETARIA DE GOBIERNO',
  'SECRETARIA DE OBRAS PUBLICAS',
  'SECRETARIA DE SALUD',
  'SECRETARIA DE SERVICIOS PUBLICOS',
] as const;

const ESTADOS_CIVILES = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Separado/a',
  'Unión convivencial',
] as const;

const FUNCIONES = [
  'Administrativo',
  'Operario',
  'Maestranza',
  'Chofer',
  'Guardavida',
  'Guardaparques',
  'Guía Turístico',
  'Inspector',
  'Profesional de la Salud',
  'Docente',
  'Profesional Informático',
  'Profesional en general',
  'Técnico en general',
  'Personal de Seguridad',
  'Cajero',
  'Juez',
  'Fiscal',
  'Concejal',
] as const;

export class FamiliarDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  vinculo!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?\d[\d\s().-]{6,18}\d$/, {
    message: 'El teléfono del familiar no tiene un formato válido',
  })
  telefono?: string;
}

export class SolicitudDatosDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  domicilio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?\d[\d\s().-]{6,18}\d$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  telefono?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  telefonos?: string[];

  @IsOptional()
  @IsEmail()
  correoElectronico?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(REPARTICIONES)
  reparticion?: string;

  @IsOptional()
  @IsIn(ESTADOS_CIVILES)
  estadoCivil?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamiliarDto)
  familiares?: FamiliarDto[];

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i, {
    message: 'La foto debe ser una imagen JPG, PNG o WEBP válida',
  })
  foto?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,[a-z0-9+/=]+$/i, {
    message: 'El certificado debe ser una imagen JPG, PNG, WEBP o un PDF válido',
  })
  certificadoDiscapacidad?: string;

  @IsOptional()
  @IsIn(FUNCIONES)
  funcion?: string;

  @IsOptional()
  @IsBoolean()
  poseeCud?: boolean;
}

export class CreateSolicitudDto {
  @IsOptional()
  @IsString()
  empleadoId?: string;

  @IsOptional()
  @IsString()
  legajo?: string;

  @ValidateNested()
  @Type(() => SolicitudDatosDto)
  cambios!: SolicitudDatosDto;
}
