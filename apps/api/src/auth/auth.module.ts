import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TenantService } from './tenant.service';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
    }),
  ],
  providers: [AuthService, TenantService, JwtStrategy, PrismaService, EmailService],
  controllers: [AuthController],
  exports: [AuthService, TenantService],
})
export class AuthModule {}