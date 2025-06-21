import { IsString, IsEmail, IsNotEmpty, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';

export class TenantRegistrationDto {
  // Daycare Information
  @IsString()
  @IsNotEmpty()
  daycareName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' })
  subdomain: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  // Administrator Information
  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
  })
  password: string;

  // Business Settings (Optional)
  @IsOptional()
  businessHours?: {
    openTime?: string;
    closeTime?: string;
  };

  // Terms and Conditions
  @IsBoolean()
  acceptTerms: boolean;
}