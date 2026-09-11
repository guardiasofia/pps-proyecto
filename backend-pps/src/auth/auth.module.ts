import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { Usuario } from './entities/usuario.entity.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? process.env.JWT_PUBLIC_KEY ?? 'pps-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
