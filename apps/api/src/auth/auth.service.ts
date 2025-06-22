import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../common/email.service';
import { User, UserRole } from '@prisma/client';
import { InviteStaffDto, AcceptInvitationDto } from './staff-invitation.dto';

export interface LoginDto {
  email: string;
  password: string;
  tenantSubdomain?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password, tenantSubdomain } = loginDto;
    
    // First check if user exists and is invited but hasn't accepted yet
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (existingUser && existingUser.isInvited && !existingUser.emailVerified) {
      throw new UnauthorizedException('Please accept your invitation first to activate your account');
    }
    
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // If tenant subdomain is provided, validate user belongs to that tenant
    if (tenantSubdomain && user.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { subdomain: tenantSubdomain },
      });

      if (!tenant || tenant.id !== user.tenantId) {
        throw new UnauthorizedException('User does not belong to this tenant');
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        tenant: (user as any).tenant ? {
          id: (user as any).tenant.id,
          name: (user as any).tenant.name,
          subdomain: (user as any).tenant.subdomain,
        } : null,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, role, tenantId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours from now

    // Create user as unverified
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        tenantId,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
      include: { tenant: true },
    });

    // Send verification email
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.emailService.sendVerificationEmail(
      email,
      firstName,
      verificationToken,
      baseUrl
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        emailVerified: user.emailVerified,
        tenant: (user as any).tenant ? {
          id: (user as any).tenant.id,
          name: (user as any).tenant.name,
          subdomain: (user as any).tenant.subdomain,
        } : null,
      },
    };
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.emailService.sendVerificationEmail(
      email,
      user.firstName,
      verificationToken,
      baseUrl
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  async inviteStaff(inviteStaffDto: InviteStaffDto, invitedBy: string, tenantId: string) {
    const { email, firstName, lastName, phone, role, classroomIds } = inviteStaffDto;

    // Validate that the person inviting has permission (BUSINESS_ADMIN or SUPER_ADMIN)
    const inviter = await this.prisma.user.findUnique({
      where: { id: invitedBy },
    });

    if (!inviter || (inviter.role !== UserRole.BUSINESS_ADMIN && inviter.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only business admins can invite staff members');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but is not verified and was invited, we can resend invitation
      if (existingUser.isInvited && !existingUser.emailVerified) {
        return this.resendStaffInvitation(existingUser.id, invitedBy);
      }
      throw new ConflictException('User with this email already exists');
    }

    // Validate role - only allow staff roles to be invited
    if (role === UserRole.SUPER_ADMIN || role === UserRole.PARENT) {
      throw new BadRequestException('Cannot invite users with this role');
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date();
    invitationExpiry.setHours(invitationExpiry.getHours() + 72); // 72 hours for invitation

    // Create user as invited (no password yet)
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role,
        tenantId,
        isInvited: true,
        invitationToken,
        invitationExpiresAt: invitationExpiry,
        invitedBy,
        invitedAt: new Date(),
        emailVerified: false,
        password: null, // Will be set when they accept invitation
      },
      include: { tenant: true },
    });

    // If classrooms are specified, create assignments (for EDUCATOR role)
    if (classroomIds && role === UserRole.EDUCATOR) {
      await Promise.all(
        classroomIds.map(classroomId =>
          this.prisma.teacherClassroomAssignment.create({
            data: {
              teacherId: user.id,
              classroomId: classroomId,
            },
          })
        )
      );
    }

    // Send invitation email
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.emailService.sendStaffInvitationEmail(
      email,
      firstName,
      invitationToken,
      baseUrl,
      inviter.firstName,
      (user as any).tenant?.name || 'Daycare'
    );

    return {
      message: 'Staff invitation sent successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        isInvited: user.isInvited,
        invitedAt: user.invitedAt,
      },
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const { token, password } = acceptInvitationDto;

    // Find user with valid invitation token
    const user = await this.prisma.user.findFirst({
      where: {
        invitationToken: token,
        invitationExpiresAt: {
          gt: new Date(),
        },
        isInvited: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user - set password, mark as verified, clear invitation fields
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
        isInvited: false,
        invitationToken: null,
        invitationExpiresAt: null,
      },
      include: { tenant: true },
    });

    return {
      message: 'Invitation accepted successfully. You can now log in.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
        emailVerified: updatedUser.emailVerified,
        tenant: (updatedUser as any).tenant ? {
          id: (updatedUser as any).tenant.id,
          name: (updatedUser as any).tenant.name,
          subdomain: (updatedUser as any).tenant.subdomain,
        } : null,
      },
    };
  }

  async resendStaffInvitation(userId: string, resendBy: string) {
    // Validate that the person resending has permission
    const resender = await this.prisma.user.findUnique({
      where: { id: resendBy },
    });

    if (!resender || (resender.role !== UserRole.BUSINESS_ADMIN && resender.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only business admins can resend staff invitations');
    }

    // Find the user to resend invitation to
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isInvited) {
      throw new BadRequestException('User was not invited or has already accepted the invitation');
    }

    if (user.emailVerified) {
      throw new BadRequestException('User has already accepted the invitation');
    }

    // Generate new invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date();
    invitationExpiry.setHours(invitationExpiry.getHours() + 72);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        invitationToken: invitationToken,
        invitationExpiresAt: invitationExpiry,
        invitedAt: new Date(),
      },
    });

    // Send invitation email
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.emailService.sendStaffInvitationEmail(
      user.email,
      user.firstName,
      invitationToken,
      baseUrl,
      resender.firstName,
      (user as any).tenant?.name || 'Daycare'
    );

    return {
      message: 'Staff invitation resent successfully',
    };
  }

  async getInvitedUsers(tenantId: string) {
    const invitedUsers = await this.prisma.user.findMany({
      where: {
        tenantId,
        isInvited: true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        invitedAt: true,
        invitationExpiresAt: true,
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });

    return invitedUsers;
  }

  async cancelInvitation(userId: string, canceledBy: string) {
    // Validate that the person canceling has permission
    const canceler = await this.prisma.user.findUnique({
      where: { id: canceledBy },
    });

    if (!canceler || (canceler.role !== UserRole.BUSINESS_ADMIN && canceler.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only business admins can cancel staff invitations');
    }

    // Find the user to cancel invitation for
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isInvited || user.emailVerified) {
      throw new BadRequestException('Cannot cancel this invitation');
    }

    // Delete the invited user since they haven't accepted yet
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Staff invitation canceled successfully',
    };
  }
}