import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BusinessStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { TenantRegistrationDto } from './tenant-registration.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    return !existing;
  }

  async validateTenantRegistration(dto: TenantRegistrationDto): Promise<void> {
    // Check subdomain availability
    const isSubdomainAvailable = await this.checkSubdomainAvailability(dto.subdomain);
    if (!isSubdomainAvailable) {
      throw new ConflictException('Subdomain is already taken');
    }

    // Check if admin email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if tenant email already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { email: dto.email },
    });
    if (existingTenant) {
      throw new ConflictException('Tenant with this email already exists');
    }

    // Validate terms acceptance
    if (!dto.acceptTerms) {
      throw new BadRequestException('You must accept the terms and conditions');
    }
  }

  async createTenant(dto: TenantRegistrationDto) {
    // Validate the registration data
    await this.validateTenantRegistration(dto);

    // Hash admin password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create tenant and admin user in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: dto.daycareName,
          subdomain: dto.subdomain,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          status: BusinessStatus.ACTIVE,
        },
      });

      // Create tenant settings
      await prisma.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          settings: {
            businessHours: dto.businessHours || {
              openTime: '07:00',
              closeTime: '18:00',
            },
            checkInRequired: true,
            latePickupFee: 25.00,
            registrationFee: 50.00,
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            notificationPreferences: {
              email: true,
              sms: false,
              push: true,
            },
          },
        },
      });

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.adminFirstName,
          lastName: dto.adminLastName,
          phone: dto.phone,
          role: UserRole.BUSINESS_ADMIN,
          tenantId: tenant.id,
          emailVerified: false, // Will be verified via email
          isActive: true,
        },
      });

      // Create default document types for the tenant
      await prisma.documentType.createMany({
        data: [
          {
            name: 'Enrollment Form',
            description: 'Completed enrollment application',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
            isRequired: true,
            expiryRequired: false,
            maxSizeMB: 5,
          },
          {
            name: 'Medical Form',
            description: 'Health information and medical history',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
            isRequired: true,
            expiryRequired: false,
            maxSizeMB: 5,
          },
          {
            name: 'Immunization Records',
            description: 'Up-to-date vaccination records',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
            isRequired: true,
            expiryRequired: true,
            maxSizeMB: 10,
          },
          {
            name: 'Birth Certificate',
            description: 'Official birth certificate',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
            isRequired: true,
            expiryRequired: false,
            maxSizeMB: 10,
          },
          {
            name: 'Emergency Contact Form',
            description: 'Emergency contact information',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
            isRequired: true,
            expiryRequired: false,
            maxSizeMB: 5,
          },
          {
            name: 'Consent Form',
            description: 'Parental consent and authorization',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
            isRequired: true,
            expiryRequired: false,
            maxSizeMB: 5,
          },
        ],
      });

      return { tenant, adminUser };
    });

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        email: result.tenant.email,
        status: result.tenant.status,
        planExpiry: null, // Can be set later when subscription is configured
      },
      admin: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        role: result.adminUser.role,
      },
      message: 'Please check your email to verify your account',
    };
  }

  async findTenantBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        settings: true,
      },
    });
  }

  async findTenantById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            children: true,
            services: true,
          },
        },
      },
    });
  }
}