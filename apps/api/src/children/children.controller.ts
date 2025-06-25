import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ValidationPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildDto, UpdateChildDto, UploadPhotoDto } from './child.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('children')
@ApiBearerAuth('JWT-auth')
@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @ApiOperation({ summary: 'Enroll a new child', description: 'Create a new child record with parent details, medical information, and emergency contacts' })
  @ApiResponse({ status: 201, description: 'Child enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post()
  async createChild(
    @Request() req,
    @Body(ValidationPipe) createChildDto: CreateChildDto
  ) {
    return this.childrenService.createChild(
      createChildDto,
      req.user.tenantId,
      req.user.userId
    );
  }

  @ApiOperation({ summary: 'Get children list', description: 'Retrieve paginated list of children with filtering options' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by child status' })
  @ApiQuery({ name: 'classroomId', required: false, description: 'Filter by classroom' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'Children list retrieved successfully' })
  @Get()
  async getChildren(
    @Request() req,
    @Query('status') status?: string,
    @Query('classroomId') classroomId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.childrenService.getChildren(
      req.user.tenantId,
      status,
      classroomId,
      pageNum,
      limitNum
    );
  }

  @Get(':id')
  async getChildById(@Request() req, @Param('id') id: string) {
    return this.childrenService.getChildById(id, req.user.tenantId);
  }

  @Put(':id')
  async updateChild(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) updateChildDto: UpdateChildDto
  ) {
    return this.childrenService.updateChild(id, updateChildDto, req.user.tenantId);
  }

  @Delete(':id')
  async deleteChild(@Request() req, @Param('id') id: string) {
    return this.childrenService.deleteChild(id, req.user.tenantId);
  }

  @ApiOperation({ summary: 'Upload child photo', description: 'Upload a photo for a child with optional caption and profile photo flag' })
  @ApiParam({ name: 'id', description: 'Child ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Photo upload with metadata',
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
        caption: {
          type: 'string',
          description: 'Optional photo caption',
        },
        isProfilePhoto: {
          type: 'boolean',
          description: 'Set as profile photo',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully' })
  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() uploadPhotoDto: UploadPhotoDto
  ) {
    return this.childrenService.uploadPhoto(id, file, uploadPhotoDto, req.user.tenantId);
  }

  @Get(':id/photos')
  async getChildPhotos(@Request() req, @Param('id') id: string) {
    return this.childrenService.getChildPhotos(id, req.user.tenantId);
  }

  @Delete(':id/photos/:photoId')
  async deletePhoto(
    @Request() req,
    @Param('id') id: string,
    @Param('photoId') photoId: string
  ) {
    return this.childrenService.deletePhoto(id, photoId, req.user.tenantId);
  }
}