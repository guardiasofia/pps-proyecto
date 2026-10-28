import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  IsString,
  ValidateNested,
  IsDateString,
  IsInt,
} from 'class-validator';

const ESTADOS_CIVILES = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Separado/a',
  'Unión convivencial',
] as const;

export class FamiliarDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellidos!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombres!: string;

  @IsString()
  @IsIn(['DNI', 'LC', 'LE', 'CI', 'Pasaporte'])
  tipoDocumento!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9.-]{3,20}$/)
  numeroDocumento!: string;

  @IsString()
  @IsIn(['F', 'M', 'X'])
  sexo!: string;

  @IsDateString()
  fechaNacimiento!: string;

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

  @IsOptional()
  @IsBoolean()
  discapacitado?: boolean;
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
  @Type(() => Number)
  @IsInt()
  reparticion?: number;

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
  @Matches(
    /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,[a-z0-9+/=]+$/i,
    {
      message:
        'El certificado debe ser una imagen JPG, PNG, WEBP o un PDF válido',
    },
  )
  certificadoDiscapacidad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  funcion?: number;

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
