import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum Relationship {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER'
}

export class CreateParentRelationshipDto {
  @IsString()
  childId: string;

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

export class UpdateParentRelationshipDto {
  @IsOptional()
  @IsEnum(Relationship)
  relationship?: Relationship;

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

export class AddExistingParentDto {
  @IsString()
  childId: string;

  @IsString()
  parentId: string;

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