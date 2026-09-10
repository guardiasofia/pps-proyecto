import { IsOptional, IsString } from 'class-validator';

export class FiltroEmpleadoDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
