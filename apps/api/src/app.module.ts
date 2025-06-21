import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [AuthModule, BusinessModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
