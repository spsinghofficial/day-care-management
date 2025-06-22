import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Request, Query, Param, Delete } from '@nestjs/common';
import { AuthService, LoginDto, RegisterDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantService } from './tenant.service';
import { TenantRegistrationDto } from './tenant-registration.dto';
import { InviteStaffDto, AcceptInvitationDto, ResendInvitationDto } from './staff-invitation.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tenantService: TenantService,
  ) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-tenant')
  async registerTenant(@Body(ValidationPipe) tenantRegistrationDto: TenantRegistrationDto) {
    return this.tenantService.createTenant(tenantRegistrationDto);
  }

  @Get('validate-subdomain')
  async validateSubdomain(@Query('subdomain') subdomain: string) {
    if (!subdomain) {
      return { available: false, message: 'Subdomain is required' };
    }

    const available = await this.tenantService.checkSubdomainAvailability(subdomain);
    return { 
      available,
      message: available ? 'Subdomain is available' : 'Subdomain is already taken'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    const user = await this.authService.findUserById(req.user.userId);
    if (!user) {
      return null;
    }

    return {
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
    };
  }

  // Staff invitation endpoints
  @UseGuards(JwtAuthGuard)
  @Post('invite-staff')
  async inviteStaff(@Request() req, @Body(ValidationPipe) inviteStaffDto: InviteStaffDto) {
    return this.authService.inviteStaff(inviteStaffDto, req.user.userId, req.user.tenantId);
  }

  @Post('accept-invitation')
  async acceptInvitation(@Body(ValidationPipe) acceptInvitationDto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(acceptInvitationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-invitation')
  async resendInvitation(@Request() req, @Body(ValidationPipe) resendInvitationDto: ResendInvitationDto) {
    return this.authService.resendStaffInvitation(resendInvitationDto.userId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invited-users')
  async getInvitedUsers(@Request() req) {
    return this.authService.getInvitedUsers(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cancel-invitation/:userId')
  async cancelInvitation(@Request() req, @Param('userId') userId: string) {
    return this.authService.cancelInvitation(userId, req.user.userId);
  }
}