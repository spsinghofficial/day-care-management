import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { ParentRelationshipController } from './parent-relationship.controller';
import { ParentRelationshipService } from './parent-relationship.service';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../common/email.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChildrenController, ParentRelationshipController],
  providers: [ChildrenService, ParentRelationshipService, PrismaService, EmailService],
  exports: [ChildrenService, ParentRelationshipService],
})
export class ChildrenModule {}