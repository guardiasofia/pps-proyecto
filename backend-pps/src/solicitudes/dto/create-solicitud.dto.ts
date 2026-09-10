import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SolicitudDatosDto {
  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  telefonos?: string[];

  @IsOptional()
  @IsEmail()
  correoElectronico?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  reparticion?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  familiares?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  certificadoDiscapacidad?: string;

  @IsOptional()
  @IsString()
  funcion?: string;
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
