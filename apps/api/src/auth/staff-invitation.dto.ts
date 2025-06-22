import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InviteStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString({ each: true })
  classroomIds?: string[];
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  password: string;
}

export class ResendInvitationDto {
  @IsString()
  userId: string;
}