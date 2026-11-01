import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const TELEFONO = /^[+]?[(]?\d[\d\s().-]{6,18}\d$/;

export class FamiliarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  apellidos: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nombres: string;

  @IsIn(['DNI', 'LC', 'LE', 'CI', 'Pasaporte'])
  tipoDocumento: string;

  @IsString()
  @Matches(/^[A-Za-z0-9.-]{3,20}$/)
  numeroDocumento: string;

  @IsIn(['F', 'M', 'X'])
  sexo: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  vinculo: string;

  @IsOptional()
  @IsString()
  @Matches(TELEFONO)
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  discapacitado?: boolean;
}

/** Datos del legajo que un empleado puede pedir modificar. */
export class SolicitudDatosDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  domicilio?: string;

  @IsOptional()
  @IsString()
  @Matches(TELEFONO)
  telefono?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @Matches(TELEFONO, { each: true })
  telefonos?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  correoElectronico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  reparticion?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  funcion?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estadoCivil?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FamiliarDto)
  familiares?: FamiliarDto[];

  @IsOptional()
  @IsString()
  @MaxLength(7_000_000)
  foto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7_000_000)
  certificadoDiscapacidad?: string;

  @IsOptional()
  @IsBoolean()
  poseeCud?: boolean;
}

export class CreateSolicitudDto {
  @ValidateNested()
  @Type(() => SolicitudDatosDto)
  cambios: SolicitudDatosDto;
}

export class AprobarSolicitudDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}

export class RechazarSolicitudDto {
  @IsString()
  @Matches(/\S/)
  @MaxLength(500)
  motivo: string;
}
