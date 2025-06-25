import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateParentRelationshipDto, UpdateParentRelationshipDto, AddExistingParentDto } from './parent-relationship.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../common/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ParentRelationshipService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async addNewParentToChild(createParentRelationshipDto: CreateParentRelationshipDto, tenantId: string) {
    const { childId, isPrimary, ...parentDetails } = createParentRelationshipDto;

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

    // Check if relationship already exists
    const existingRelationship = await this.prisma.parentChildRelationship.findFirst({
      where: {
        parentId: parent.id,
        childId: childId,
      },
    });

    if (existingRelationship) {
      throw new ConflictException('Parent is already associated with this child');
    }

    // If this is set as primary, ensure no other parent is primary for this child
    if (isPrimary) {
      await this.prisma.parentChildRelationship.updateMany({
        where: {
          childId: childId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create parent-child relationship
    const relationship = await this.prisma.parentChildRelationship.create({
      data: {
        parentId: parent.id,
        childId: childId,
        relationship: createParentRelationshipDto.relationship,
        isPrimary: isPrimary || false,
        isEmergencyContact: createParentRelationshipDto.isEmergencyContact || true,
        canPickup: createParentRelationshipDto.canPickup || true,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            emailVerified: true,
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      relationship,
      isNewParent: !parent.emailVerified,
      message: parent.emailVerified 
        ? 'Parent added to child successfully'
        : 'Parent added to child and welcome email sent',
    };
  }

  async addExistingParentToChild(addExistingParentDto: AddExistingParentDto, tenantId: string) {
    const { childId, parentId, isPrimary, ...relationshipData } = addExistingParentDto;

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

    // Verify parent exists and belongs to tenant
    const parent = await this.prisma.user.findFirst({
      where: {
        id: parentId,
        tenantId: tenantId,
        role: UserRole.PARENT,
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Check if relationship already exists
    const existingRelationship = await this.prisma.parentChildRelationship.findFirst({
      where: {
        parentId: parentId,
        childId: childId,
      },
    });

    if (existingRelationship) {
      throw new ConflictException('Parent is already associated with this child');
    }

    // If this is set as primary, ensure no other parent is primary for this child
    if (isPrimary) {
      await this.prisma.parentChildRelationship.updateMany({
        where: {
          childId: childId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create parent-child relationship
    const relationship = await this.prisma.parentChildRelationship.create({
      data: {
        parentId: parentId,
        childId: childId,
        ...relationshipData,
        isPrimary: isPrimary || false,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            emailVerified: true,
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      relationship,
      message: 'Existing parent added to child successfully',
    };
  }

  async updateParentChildRelationship(
    relationshipId: string, 
    updateDto: UpdateParentRelationshipDto, 
    tenantId: string
  ) {
    // Find the relationship and verify it belongs to the tenant
    const relationship = await this.prisma.parentChildRelationship.findFirst({
      where: {
        id: relationshipId,
        child: {
          tenantId: tenantId,
        },
      },
      include: {
        child: true,
        parent: true,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Parent-child relationship not found');
    }

    // If setting as primary, ensure no other parent is primary for this child
    if (updateDto.isPrimary) {
      await this.prisma.parentChildRelationship.updateMany({
        where: {
          childId: relationship.childId,
          isPrimary: true,
          id: {
            not: relationshipId,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update the relationship
    const updatedRelationship = await this.prisma.parentChildRelationship.update({
      where: { id: relationshipId },
      data: updateDto,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            emailVerified: true,
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      relationship: updatedRelationship,
      message: 'Parent-child relationship updated successfully',
    };
  }

  async removeParentFromChild(relationshipId: string, tenantId: string) {
    // Find the relationship and verify it belongs to the tenant
    const relationship = await this.prisma.parentChildRelationship.findFirst({
      where: {
        id: relationshipId,
        child: {
          tenantId: tenantId,
        },
      },
      include: {
        child: {
          include: {
            parentChildRelationships: true,
          },
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Parent-child relationship not found');
    }

    // Ensure at least one parent remains
    if (relationship.child.parentChildRelationships.length <= 1) {
      throw new BadRequestException('Cannot remove the last parent from a child');
    }

    // If removing the primary parent, set another parent as primary
    if (relationship.isPrimary) {
      const otherRelationship = relationship.child.parentChildRelationships.find(
        rel => rel.id !== relationshipId
      );
      
      if (otherRelationship) {
        await this.prisma.parentChildRelationship.update({
          where: { id: otherRelationship.id },
          data: { isPrimary: true },
        });
      }
    }

    // Delete the relationship
    await this.prisma.parentChildRelationship.delete({
      where: { id: relationshipId },
    });

    return {
      message: 'Parent removed from child successfully',
    };
  }

  async getChildParents(childId: string, tenantId: string) {
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

    const relationships = await this.prisma.parentChildRelationship.findMany({
      where: {
        childId: childId,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            emailVerified: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        isPrimary: 'desc',
      },
    });

    return relationships.map(rel => ({
      relationshipId: rel.id,
      parent: rel.parent,
      relationship: rel.relationship,
      isPrimary: rel.isPrimary,
      isEmergencyContact: rel.isEmergencyContact,
      canPickup: rel.canPickup,
      createdAt: rel.createdAt,
    }));
  }

  async getAvailableParents(tenantId: string, searchTerm?: string) {
    const where: any = {
      tenantId: tenantId,
      role: UserRole.PARENT,
    };

    if (searchTerm) {
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const parents = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        emailVerified: true,
        parentChildRelationships: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    return parents.map(parent => ({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      emailVerified: parent.emailVerified,
      childrenCount: parent.parentChildRelationships.length,
      children: parent.parentChildRelationships.map(rel => rel.child),
    }));
  }
}