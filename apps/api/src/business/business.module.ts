import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [BusinessService, PrismaService],
  controllers: [BusinessController],
  exports: [BusinessService],
})
export class BusinessModule {}