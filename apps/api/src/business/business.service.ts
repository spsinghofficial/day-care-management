import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BusinessStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface CreateBusinessDto {
  // Business details
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Admin user details
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
}

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  generateSubdomain(businessName: string): string {
    // Convert to lowercase and replace spaces/special chars with hyphens
    let subdomain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure it's not too long
    if (subdomain.length > 30) {
      subdomain = subdomain.substring(0, 30).replace(/-$/g, '');
    }

    return subdomain;
  }

  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    return !existing;
  }

  async createBusiness(createBusinessDto: CreateBusinessDto) {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
      adminPhone,
    } = createBusinessDto;

    // Generate subdomain from business name
    let subdomain = this.generateSubdomain(name);
    
    // Check if subdomain is available
    let isAvailable = await this.checkSubdomainAvailability(subdomain);
    let counter = 1;
    
    while (!isAvailable) {
      const newSubdomain = `${subdomain}-${counter}`;
      isAvailable = await this.checkSubdomainAvailability(newSubdomain);
      if (isAvailable) {
        subdomain = newSubdomain;
      }
      counter++;
      
      if (counter > 100) {
        throw new BadRequestException('Unable to generate unique subdomain');
      }
    }

    // Check if business email already exists
    const existingBusiness = await this.prisma.tenant.findUnique({
      where: { email },
    });

    if (existingBusiness) {
      throw new ConflictException('Business with this email already exists');
    }

    // Check if admin email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create business and admin user in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name,
          subdomain,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          country: country || 'USA',
          status: BusinessStatus.ACTIVE,
        },
      });

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          phone: adminPhone,
          role: UserRole.BUSINESS_ADMIN,
          tenantId: tenant.id,
          emailVerified: true,
          isActive: true,
        },
      });

      // Create default document types for the business
      await prisma.documentType.createMany({
        data: [
          {
            name: 'Immunization Records',
            description: 'Up-to-date vaccination records',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
            isRequired: true,
            expiryRequired: true,
          },
          {
            name: 'Birth Certificate',
            description: 'Official birth certificate',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
            isRequired: true,
            expiryRequired: false,
          },
          {
            name: 'Emergency Contact Form',
            description: 'Emergency contact information',
            tenantId: tenant.id,
            allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
            isRequired: true,
            expiryRequired: false,
          },
        ],
      });

      return { tenant, adminUser };
    });

    return {
      business: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        email: result.tenant.email,
        status: result.tenant.status,
      },
      adminUser: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
        role: result.adminUser.role,
      },
    };
  }

  async findBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        status: true,
      },
    });
  }

  async getAllBusinesses() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            children: true,
            services: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}