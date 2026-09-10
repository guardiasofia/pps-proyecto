import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../common/decorators/user.decorator.js';

@Controller('auth')
export class AuthController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: any) {
    return { user };
  }
}
