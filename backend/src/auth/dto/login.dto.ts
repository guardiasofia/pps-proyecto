import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[0-9\s.-]+$/)
  cuil!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  password!: string;
}
