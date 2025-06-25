import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateChildDto, UpdateChildDto, UploadPhotoDto } from './child.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../common/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async createChild(createChildDto: CreateChildDto, tenantId: string, createdBy: string) {
    const { parentDetails, medicalInfo, emergencyContacts, ...childData } = createChildDto;

    // Check if parent already exists
    let parent = await this.prisma.user.findUnique({
      where: { 
        email: parentDetails.email,
        tenantId: tenantId 
      },
    });

    // If parent doesn't exist, create them
    if (!parent) {
      // Generate temporary password for parent
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpiry = new Date();
      verificationExpiry.setHours(verificationExpiry.getHours() + 24);

      parent = await this.prisma.user.create({
        data: {
          email: parentDetails.email,
          password: hashedPassword,
          firstName: parentDetails.firstName,
          lastName: parentDetails.lastName,
          phone: parentDetails.phone,
          role: UserRole.PARENT,
          tenantId: tenantId,
          emailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpiry: verificationExpiry,
        },
      });

      // Send welcome email with temporary password
      const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendParentWelcomeEmail(
        parentDetails.email,
        parentDetails.firstName,
        tempPassword,
        verificationToken,
        baseUrl
      );
    }

    // Create child
    const child = await this.prisma.child.create({
      data: {
        ...childData,
        tenantId: tenantId,
        enrollmentDate: childData.enrollmentDate ? new Date(childData.enrollmentDate) : new Date(),
        dateOfBirth: new Date(childData.dateOfBirth),
      },
    });

    // Create parent-child relationship
    await this.prisma.parentChildRelationship.create({
      data: {
        parentId: parent.id,
        childId: child.id,
        relationship: parentDetails.relationship,
        isPrimary: parentDetails.isPrimary || true,
        isEmergencyContact: parentDetails.isEmergencyContact || true,
        canPickup: parentDetails.canPickup || true,
      },
    });

    // Create medical information if provided
    if (medicalInfo) {
      await this.prisma.medicalInformation.create({
        data: {
          childId: child.id,
          ...medicalInfo,
          allergies: medicalInfo.allergies ? JSON.stringify(medicalInfo.allergies) : null,
          medications: medicalInfo.medications ? JSON.stringify(medicalInfo.medications) : null,
          medicalConditions: medicalInfo.medicalConditions ? JSON.stringify(medicalInfo.medicalConditions) : null,
        },
      });
    }

    // Create emergency contacts if provided
    if (emergencyContacts && emergencyContacts.length > 0) {
      await this.prisma.emergencyContact.createMany({
        data: emergencyContacts.map(contact => ({
          childId: child.id,
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email || null,
          isAuthorizedPickup: contact.isAuthorizedPickup || false,
          notes: contact.notes || null,
        })),
      });
    }

    // If classroom is specified, create assignment
    if (childData.classroomId) {
      // Check classroom capacity
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: childData.classroomId },
        include: {
          children: {
            where: { isActive: true }
          }
        }
      });

      if (!classroom) {
        throw new NotFoundException('Classroom not found');
      }

      if (classroom.children.length >= classroom.capacity) {
        throw new BadRequestException('Classroom is at full capacity');
      }

      await this.prisma.classroomAssignment.create({
        data: {
          childId: child.id,
          classroomId: childData.classroomId,
          startDate: new Date(),
          isActive: true,
        },
      });

      // Update classroom enrollment count
      await this.prisma.classroom.update({
        where: { id: childData.classroomId },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      });
    }

    return this.getChildById(child.id, tenantId);
  }

  async getChildren(tenantId: string, status?: string, classroomId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      tenantId: tenantId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (classroomId) {
      where.classroomAssignments = {
        some: {
          classroomId: classroomId,
          isActive: true,
        },
      };
    }

    const [children, total] = await Promise.all([
      this.prisma.child.findMany({
        where,
        include: {
          classroomAssignments: {
            where: { isActive: true },
            include: {
              classroom: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          parentChildRelationships: {
            include: {
              parent: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.child.count({ where }),
    ]);

    return {
      children: children.map(child => ({
        ...child,
        age: this.calculateAge(child.dateOfBirth),
        classroom: child.classroomAssignments[0]?.classroom || null,
        parents: child.parentChildRelationships.map(rel => ({
          ...rel.parent,
          relationship: rel.relationship,
          isPrimary: rel.isPrimary,
        })),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChildById(childId: string, tenantId: string) {
    const child = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
      include: {
        classroomAssignments: {
          where: { isActive: true },
          include: {
            classroom: {
              select: {
                id: true,
                name: true,
                ageGroup: true,
              },
            },
          },
        },
        parentChildRelationships: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        medicalInformation: true,
        emergencyContacts: true,
        immunizationRecords: {
          orderBy: {
            dateReceived: 'desc',
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return {
      ...child,
      age: this.calculateAge(child.dateOfBirth),
      classroom: child.classroomAssignments[0]?.classroom || null,
      parents: child.parentChildRelationships.map(rel => ({
        ...rel.parent,
        relationship: rel.relationship,
        isPrimary: rel.isPrimary,
        isEmergencyContact: rel.isEmergencyContact,
        canPickup: rel.canPickup,
      })),
    };
  }

  async updateChild(childId: string, updateChildDto: UpdateChildDto, tenantId: string) {
    const { medicalInfo, emergencyContacts, ...childData } = updateChildDto;

    // Verify child exists and belongs to tenant
    const existingChild = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    if (!existingChild) {
      throw new NotFoundException('Child not found');
    }

    // Update child data
    const updatedChild = await this.prisma.child.update({
      where: { id: childId },
      data: {
        ...childData,
        dateOfBirth: childData.dateOfBirth ? new Date(childData.dateOfBirth) : undefined,
        enrollmentDate: childData.enrollmentDate ? new Date(childData.enrollmentDate) : undefined,
        withdrawalDate: childData.withdrawalDate ? new Date(childData.withdrawalDate) : undefined,
      },
    });

    // Update medical information if provided
    if (medicalInfo) {
      await this.prisma.medicalInformation.upsert({
        where: { childId: childId },
        create: {
          childId: childId,
          ...medicalInfo,
          allergies: medicalInfo.allergies ? JSON.stringify(medicalInfo.allergies) : null,
          medications: medicalInfo.medications ? JSON.stringify(medicalInfo.medications) : null,
          medicalConditions: medicalInfo.medicalConditions ? JSON.stringify(medicalInfo.medicalConditions) : null,
        },
        update: {
          ...medicalInfo,
          allergies: medicalInfo.allergies ? JSON.stringify(medicalInfo.allergies) : undefined,
          medications: medicalInfo.medications ? JSON.stringify(medicalInfo.medications) : undefined,
          medicalConditions: medicalInfo.medicalConditions ? JSON.stringify(medicalInfo.medicalConditions) : undefined,
        },
      });
    }

    // Update emergency contacts if provided
    if (emergencyContacts) {
      // Delete existing emergency contacts
      await this.prisma.emergencyContact.deleteMany({
        where: { childId: childId },
      });

      // Create new emergency contacts
      if (emergencyContacts.length > 0) {
        await this.prisma.emergencyContact.createMany({
          data: emergencyContacts.map(contact => ({
            childId: childId,
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email || null,
            isAuthorizedPickup: contact.isAuthorizedPickup || false,
            notes: contact.notes || null,
          })),
        });
      }
    }

    // Handle classroom assignment changes
    if (childData.classroomId !== undefined) {
      if (childData.classroomId) {
        // Check if child already has an active assignment
        const existingAssignment = await this.prisma.classroomAssignment.findFirst({
          where: {
            childId: childId,
            isActive: true,
          },
        });

        if (existingAssignment && existingAssignment.classroomId !== childData.classroomId) {
          // Deactivate old assignment
          await this.prisma.classroomAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              isActive: false,
              endDate: new Date(),
            },
          });

          // Update old classroom enrollment count
          await this.prisma.classroom.update({
            where: { id: existingAssignment.classroomId },
            data: {
              currentEnrollment: {
                decrement: 1,
              },
            },
          });
        }

        if (!existingAssignment || existingAssignment.classroomId !== childData.classroomId) {
          // Check new classroom capacity
          const classroom = await this.prisma.classroom.findUnique({
            where: { id: childData.classroomId },
            include: {
              children: {
                where: { isActive: true }
              }
            }
          });

          if (!classroom) {
            throw new NotFoundException('Classroom not found');
          }

          if (classroom.children.length >= classroom.capacity) {
            throw new BadRequestException('Classroom is at full capacity');
          }

          // Create new assignment
          await this.prisma.classroomAssignment.create({
            data: {
              childId: childId,
              classroomId: childData.classroomId,
              startDate: new Date(),
              isActive: true,
            },
          });

          // Update new classroom enrollment count
          await this.prisma.classroom.update({
            where: { id: childData.classroomId },
            data: {
              currentEnrollment: {
                increment: 1,
              },
            },
          });
        }
      }
    }

    return this.getChildById(childId, tenantId);
  }

  async deleteChild(childId: string, tenantId: string) {
    // Verify child exists and belongs to tenant
    const child = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Soft delete the child
    await this.prisma.child.update({
      where: { id: childId },
      data: {
        deletedAt: new Date(),
        status: 'WITHDRAWN',
      },
    });

    // Deactivate classroom assignments
    await this.prisma.classroomAssignment.updateMany({
      where: {
        childId: childId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });

    return { message: 'Child deleted successfully' };
  }

  async uploadPhoto(childId: string, file: any, uploadPhotoDto: UploadPhotoDto, tenantId: string) {
    // Verify child exists and belongs to tenant
    const child = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // In a real implementation, you would upload to cloud storage (AWS S3, Azure Blob, etc.)
    // For now, we'll simulate the upload and return a mock URL
    const mockPhotoUrl = `https://storage.example.com/children/${childId}/${file.originalname}`;
    const mockThumbnailUrl = `https://storage.example.com/children/${childId}/thumb_${file.originalname}`;

    // Create photo record
    const photo = await this.prisma.photo.create({
      data: {
        childId: childId,
        tenantId: tenantId,
        uploadedBy: 'current-user-id', // In real implementation, get from JWT
        photoUrl: mockPhotoUrl,
        thumbnailUrl: mockThumbnailUrl,
        caption: uploadPhotoDto.caption || '',
        isProfilePhoto: uploadPhotoDto.isProfilePhoto || false,
        isSharedWithParents: true,
      },
    });

    // If this is set as profile photo, update child record and unset other profile photos
    if (uploadPhotoDto.isProfilePhoto) {
      // Unset other profile photos for this child
      await this.prisma.photo.updateMany({
        where: {
          childId: childId,
          isProfilePhoto: true,
          id: { not: photo.id },
        },
        data: {
          isProfilePhoto: false,
        },
      });

      // Update child's profile photo URL
      await this.prisma.child.update({
        where: { id: childId },
        data: {
          profilePhoto: mockPhotoUrl,
        },
      });
    }

    return {
      photo: {
        id: photo.id,
        photoUrl: photo.photoUrl,
        thumbnailUrl: photo.thumbnailUrl,
        caption: photo.caption,
        isProfilePhoto: photo.isProfilePhoto,
        createdAt: photo.createdAt,
      },
      message: 'Photo uploaded successfully',
    };
  }

  async getChildPhotos(childId: string, tenantId: string) {
    // Verify child exists and belongs to tenant
    const child = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const photos = await this.prisma.photo.findMany({
      where: {
        childId: childId,
        tenantId: tenantId,
      },
      include: {
        uploadedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return photos.map(photo => ({
      id: photo.id,
      photoUrl: photo.photoUrl,
      thumbnailUrl: photo.thumbnailUrl,
      caption: photo.caption,
      isProfilePhoto: photo.isProfilePhoto,
      isSharedWithParents: photo.isSharedWithParents,
      uploadedBy: photo.uploadedByUser 
        ? `${photo.uploadedByUser.firstName} ${photo.uploadedByUser.lastName}`
        : 'Unknown',
      createdAt: photo.createdAt,
    }));
  }

  async deletePhoto(childId: string, photoId: string, tenantId: string) {
    // Verify child exists and belongs to tenant
    const child = await this.prisma.child.findFirst({
      where: {
        id: childId,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Verify photo exists and belongs to child
    const photo = await this.prisma.photo.findFirst({
      where: {
        id: photoId,
        childId: childId,
        tenantId: tenantId,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // If deleting profile photo, clear child's profile photo URL
    if (photo.isProfilePhoto) {
      await this.prisma.child.update({
        where: { id: childId },
        data: {
          profilePhoto: null,
        },
      });
    }

    // Delete photo record
    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    // In real implementation, also delete from cloud storage
    
    return { message: 'Photo deleted successfully' };
  }

  private calculateAge(dateOfBirth: Date): string {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'}`;
    }
  }
}