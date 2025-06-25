import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsArray, IsBoolean, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum ChildStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  WAITLIST = 'WAITLIST',
  WITHDRAWN = 'WITHDRAWN'
}

export enum Relationship {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER'
}

export class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isAuthorizedPickup?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MedicalInformationDto {
  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  @IsArray()
  medications?: string[];

  @IsOptional()
  @IsArray()
  medicalConditions?: string[];

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorPhone?: string;

  @IsOptional()
  @IsString()
  hospitalPreference?: string;

  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}

export class ParentDetailsDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(Relationship)
  relationship: Relationship;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;

  @IsOptional()
  @IsBoolean()
  canPickup?: boolean;
}

export class CreateChildDto {
  @ApiProperty({ description: 'Child\'s first name', example: 'Emma' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Child\'s last name', example: 'Wilson' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Child\'s date of birth', example: '2020-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @IsOptional()
  @IsString()
  classroomId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @ValidateNested()
  @Type(() => ParentDetailsDto)
  parentDetails: ParentDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInformationDto)
  medicalInfo?: MedicalInformationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];
}

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @IsOptional()
  @IsDateString()
  withdrawalDate?: string;

  @IsOptional()
  @IsEnum(ChildStatus)
  status?: ChildStatus;

  @IsOptional()
  @IsString()
  classroomId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUrl()
  profilePhotoUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInformationDto)
  medicalInfo?: MedicalInformationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];
}

export class UploadPhotoDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePhoto?: boolean;
}