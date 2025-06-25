import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ParentRelationshipService } from './parent-relationship.service';
import { CreateParentRelationshipDto, UpdateParentRelationshipDto, AddExistingParentDto } from './parent-relationship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parent-relationships')
@UseGuards(JwtAuthGuard)
export class ParentRelationshipController {
  constructor(private parentRelationshipService: ParentRelationshipService) {}

  @Post('add-new-parent')
  async addNewParentToChild(
    @Request() req,
    @Body(ValidationPipe) createParentRelationshipDto: CreateParentRelationshipDto
  ) {
    return this.parentRelationshipService.addNewParentToChild(
      createParentRelationshipDto,
      req.user.tenantId
    );
  }

  @Post('add-existing-parent')
  async addExistingParentToChild(
    @Request() req,
    @Body(ValidationPipe) addExistingParentDto: AddExistingParentDto
  ) {
    return this.parentRelationshipService.addExistingParentToChild(
      addExistingParentDto,
      req.user.tenantId
    );
  }

  @Put(':relationshipId')
  async updateParentChildRelationship(
    @Request() req,
    @Param('relationshipId') relationshipId: string,
    @Body(ValidationPipe) updateDto: UpdateParentRelationshipDto
  ) {
    return this.parentRelationshipService.updateParentChildRelationship(
      relationshipId,
      updateDto,
      req.user.tenantId
    );
  }

  @Delete(':relationshipId')
  async removeParentFromChild(
    @Request() req,
    @Param('relationshipId') relationshipId: string
  ) {
    return this.parentRelationshipService.removeParentFromChild(
      relationshipId,
      req.user.tenantId
    );
  }

  @Get('child/:childId/parents')
  async getChildParents(
    @Request() req,
    @Param('childId') childId: string
  ) {
    return this.parentRelationshipService.getChildParents(
      childId,
      req.user.tenantId
    );
  }

  @Get('available-parents')
  async getAvailableParents(
    @Request() req,
    @Query('search') searchTerm?: string
  ) {
    return this.parentRelationshipService.getAvailableParents(
      req.user.tenantId,
      searchTerm
    );
  }
}