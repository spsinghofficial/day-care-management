import { Controller, Post, Body, ValidationPipe, Get, Param, UseGuards } from '@nestjs/common';
import { BusinessService, CreateBusinessDto } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Post('onboard')
  async onboardBusiness(@Body(ValidationPipe) createBusinessDto: CreateBusinessDto) {
    return this.businessService.createBusiness(createBusinessDto);
  }

  @Get('check-subdomain/:subdomain')
  async checkSubdomain(@Param('subdomain') subdomain: string) {
    const isAvailable = await this.businessService.checkSubdomainAvailability(subdomain);
    return { available: isAvailable };
  }

  @Get('by-subdomain/:subdomain')
  async getBySubdomain(@Param('subdomain') subdomain: string) {
    const business = await this.businessService.findBySubdomain(subdomain);
    if (!business) {
      return { error: 'Business not found' };
    }
    return { business };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllBusinesses() {
    return this.businessService.getAllBusinesses();
  }

  @Post('generate-subdomain')
  async generateSubdomain(@Body() body: { businessName: string }) {
    const subdomain = this.businessService.generateSubdomain(body.businessName);
    const isAvailable = await this.businessService.checkSubdomainAvailability(subdomain);
    
    return {
      subdomain,
      available: isAvailable,
    };
  }
}