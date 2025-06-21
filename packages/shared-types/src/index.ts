// Core Multi-Tenant Types
export interface Daycare {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  email: string;
  phone?: string;
  address?: Address;
  settings: DaycareSettings;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface DaycareSettings {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    templates: NotificationTemplate[];
  };
  documentTypes: DocumentType[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// User Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DAYCARE_ADMIN = 'daycare_admin',
  EDUCATOR = 'educator',
  PARENT = 'parent'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  daycareId?: string; // null for super_admin
  isActive: boolean;
  emailVerified: boolean;
  notificationPreferences: NotificationPreference;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  email: boolean;
  sms: boolean;
  pushNotifications?: boolean;
}

// Parent-Child Relationship Types
export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  EMERGENCY_CONTACT = 'emergency_contact'
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  daycareId: string;
  parentRelationships: ParentChildRelationship[];
  enrolledServices: ServiceEnrollment[];
  documents: Document[];
  waitlistEntries: WaitlistEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentChildRelationship {
  id: string;
  parentId: string;
  childId: string;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
  createdAt: Date;
}

// Service/Program Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  daycareId: string;
  ageGroup: {
    minMonths: number;
    maxMonths: number;
  };
  capacity: number;
  schedule: ServiceSchedule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceSchedule {
  id: string;
  serviceId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface ServiceEnrollment {
  id: string;
  childId: string;
  serviceId: string;
  enrolledAt: Date;
  status: 'active' | 'inactive' | 'graduated';
}

// Waitlist Types
export enum WaitlistStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  ENROLLED = 'enrolled'
}

export interface WaitlistEntry {
  id: string;
  childId: string;
  serviceId: string;
  status: WaitlistStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

// Document Types
export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  daycareId: string;
  isRequired: boolean;
  allowedFormats: string[]; // ['pdf', 'jpg', 'png', 'doc']
  maxSizeMB: number;
  expiryRequired: boolean;
  createdAt: Date;
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface Document {
  id: string;
  childId: string;
  documentTypeId: string;
  fileName: string;
  filePath: string; // Azure Blob path
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  expiryDate?: Date;
  notes?: string;
}

// Notification Types
export enum NotificationType {
  WAITLIST_APPROVED = 'waitlist_approved',
  WAITLIST_DECLINED = 'waitlist_declined',
  DOCUMENT_REQUESTED = 'document_requested',
  DOCUMENT_APPROVED = 'document_approved',
  DOCUMENT_REJECTED = 'document_rejected',
  SCHEDULE_CHANGED = 'schedule_changed',
  GENERAL_ANNOUNCEMENT = 'general_announcement'
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  emailTemplate: string;
  smsTemplate: string;
  variables: string[]; // Template variables like {childName}, {serviceName}
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  sentVia: ('email' | 'sms')[];
  createdAt: Date;
  readAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  daycareId?: string;
  daycare?: Pick<Daycare, 'id' | 'name' | 'subdomain'>;
}

export interface LoginRequest {
  email: string;
  password: string;
  daycareSubdomain?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  daycareId: string;
  children?: ChildRegistrationData[];
  notificationPreferences: NotificationPreference;
}

export interface ChildRegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
}