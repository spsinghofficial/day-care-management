# CLAUDE.md

# Daycare Management System - Updated Project Specification

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a daycare management system built as a Turborepo monorepo with TypeScript throughout. The architecture consists of:

- **apps/api**: NestJS backend API (port 8080)
- **apps/web**: Next.js frontend application (port 3000) - main daycare management interface
- **apps/docs**: Next.js documentation site (port 3001)
- **packages/shared-types**: Shared TypeScript types across applications
- **packages/ui**: Shared React component library
- **packages/eslint-config**: ESLint configurations
- **packages/typescript-config**: TypeScript configurations

## 📘 Project Name: Daycare Management SaaS Platform

**Stack:** Next.js 14+ (Frontend), NestJS (Backend), PostgreSQL with Prisma ORM  
**Audience:** Daycare centers, parents, teachers/staff, platform administrators  
**Goal:** Build a multi-tenant SaaS platform for complete daycare management including enrollment, attendance, billing, communications, and analytics.

---

## 🧩 System Scope Overview

### ✅ Core Functional Areas
1. **Multi-Tenant Architecture & Authentication**
2. **Child & Family Management**
3. **Classroom & Staff Management**
4. **Attendance Tracking**
5. **Billing & Payments**
6. **Daily Reports & Communications**
7. **Schedule Management**
8. **Waitlist Management**
9. **Document Management**
10. **Analytics & Reporting**

---

## 🧑‍🔐 User Roles

### Super Admin (Platform Owner)
- Manage all daycare centers
- View platform analytics
- Handle subscriptions/billing
- System configuration

### Daycare Admin (Business Owner)
- Register and manage daycare center
- Manage staff accounts111111
- View business analytics
- Configure center settings
- Handle billing/payments

### Teachers/Staff
- Manage assigned classrooms
- Track attendance
- Create daily reports
- Communicate with parents
- View schedules

### Parents
- Register children
- View/pay fees
- Access schedules
- Receive notifications
- View daily reports
- Join waitlists

---

## 🏗️ Requirement Decomposition

### 1. Multi-Tenant Authentication & Access Control
- [x] Subdomain-based tenant resolution (e.g., littlestars.daycaremanager.com)
- [x] JWT authentication with refresh token rotation
- [x] Role-based access control (RBAC) per tenant
- [x] Email verification and password reset
- [x] Secure session management with tenant context
- [x] Multi-device session support

### 2. Tenant Management
- [x] Daycare registration with subdomain selection
- [x] Subscription management (Trial, Basic, Premium, Enterprise)
- [x] Business settings configuration
- [x] Custom branding (logo, colors)
- [x] Business hours and policies setup
- [x] Multi-location support (future)

### 3. Child & Family Management
- [x] Child enrollment with comprehensive profiles
- [x] Parent account creation and management
- [x] Many-to-many parent-child relationships
- [x] Medical information tracking
- [x] Emergency contacts management
- [x] Immunization records
- [x] Document uploads (birth certificates, medical forms)
- [x] Photo management

### 4. Classroom Management
- [x] Classroom creation with capacity limits
- [x] Age group configuration
- [x] Teacher assignments (Lead, Assistant, Substitute)
- [x] Child-classroom assignments
- [x] Real-time occupancy tracking
- [x] Room-based scheduling

### 5. Attendance System
- [x] Digital check-in/check-out
- [x] QR code and PIN-based authentication
- [x] Parent/guardian verification
- [x] Late pickup tracking
- [x] Attendance reports
- [x] Real-time attendance dashboard
- [x] Absence management

### 6. Billing & Payment Processing
- [x] Fee structure configuration
- [x] Automated invoice generation
- [x] Stripe payment integration
- [x] Recurring payment support
- [x] Late fee calculation
- [x] Sibling discounts
- [x] Payment history tracking
- [x] Financial reporting
- [x] Proration for partial months

### 7. Daily Reports & Communications
- [x] Digital daily reports (meals, naps, activities, mood)
- [x] Photo sharing with parents
- [x] In-app messaging system
- [x] Announcement broadcasting
- [x] Email/SMS notifications
- [x] Incident reporting
- [x] Real-time updates

### 8. Schedule Management
- [x] Classroom activity scheduling
- [x] Staff shift scheduling
- [x] Parent-viewable schedules
- [x] Special events management
- [x] Calendar integration

### 9. Waitlist Management
- [x] Online waitlist registration
- [x] Automatic position tracking
- [x] Priority management
- [x] Automated notifications when spots open
- [x] Waitlist analytics

### 10. Document Management
- [x] Secure document storage (AWS S3/Azure Blob)
- [x] Document categorization
- [x] Digital signatures
- [x] Compliance tracking
- [x] Version control
- [x] Expiry tracking

### 11. Analytics & Reporting
- [x] Enrollment statistics
- [x] Revenue tracking
- [x] Attendance patterns
- [x] Staff utilization
- [x] Custom report builder
- [x] Export capabilities

---

## 📋 User Stories (Updated)

### Authentication & Onboarding
- `US-01`: As a daycare owner, I want to register my daycare with a unique subdomain so I can start using the platform
- `US-02`: As a daycare admin, I want to invite staff members so they can access their accounts
- `US-03`: As a parent, I want to create an account after being invited so I can manage my children's enrollment
- `US-04`: As any user, I want to reset my password securely if I forget it
- `US-05`: As any user, I want my sessions to stay active while using the app without frequent re-logins

### Child Management (Parents)
- `US-06`: As a parent, I want to register my children with all required information so they can be enrolled
- `US-07`: As a parent, I want to upload required documents for my children so enrollment can be completed
- `US-08`: As a parent, I want to update my children's medical information so the daycare has current data
- `US-09`: As a parent, I want to manage emergency contacts so the right people can be reached if needed
- `US-10`: As a parent, I want to join the waitlist for programs when they're full

### Daily Operations (Parents)
- `US-11`: As a parent, I want to check in/out my child using a QR code for quick and secure access
- `US-12`: As a parent, I want to view my child's daily report so I know about their day
- `US-13`: As a parent, I want to receive photos of my child during the day
- `US-14`: As a parent, I want to view my child's schedule so I can plan accordingly
- `US-15`: As a parent, I want to communicate with my child's teacher through the app

### Billing (Parents)
- `US-16`: As a parent, I want to view my current balance and invoices
- `US-17`: As a parent, I want to pay fees online using my credit card
- `US-18`: As a parent, I want to set up automatic payments so I don't miss due dates
- `US-19`: As a parent, I want to download payment receipts for tax purposes

### Classroom Management (Teachers)
- `US-20`: As a teacher, I want to take attendance for my classroom quickly
- `US-21`: As a teacher, I want to create daily reports for each child in my class
- `US-22`: As a teacher, I want to upload photos to share with parents
- `US-23`: As a teacher, I want to report incidents when they occur
- `US-24`: As a teacher, I want to view my assigned schedule
- `US-25`: As a teacher, I want to message parents about their children

### Administrative (Daycare Admin)
- `US-26`: As an admin, I want to create and manage classrooms with capacity limits
- `US-27`: As an admin, I want to assign teachers and children to classrooms
- `US-28`: As an admin, I want to configure fee structures for different programs
- `US-29`: As an admin, I want to generate and send invoices to parents
- `US-30`: As an admin, I want to view financial reports and analytics
- `US-31`: As an admin, I want to manage the waitlist and offer spots when available
- `US-32`: As an admin, I want to broadcast announcements to parents and staff
- `US-33`: As an admin, I want to configure required documents for enrollment
- `US-34`: As an admin, I want to track staff attendance and schedules
- `US-35`: As an admin, I want to view enrollment trends and occupancy rates

### Platform Management (Super Admin)
- `US-36`: As a super admin, I want to view platform-wide analytics
- `US-37`: As a super admin, I want to manage tenant subscriptions
- `US-38`: As a super admin, I want to monitor system health and usage
- `US-39`: As a super admin, I want to configure platform-wide settings

---

## 🗂️ Core Data Models (Updated)

### Tenant & Authentication
- **Tenant** - Multi-tenant isolation (subdomain, subscription, settings)
- **User** - All user types with role-based access
- **RefreshToken** - JWT refresh token management
- **TenantSettings** - Business hours, fees, policies

### Child & Family
- **Child** - Child profiles with enrollment status
- **ParentChildRelationship** - Many-to-many with relationship types
- **EmergencyContact** - Additional authorized contacts
- **MedicalInformation** - Health data and allergies
- **ImmunizationRecord** - Vaccination tracking

### Operations
- **Classroom** - Room management with capacity
- **ClassroomAssignment** - Child-classroom relationships
- **TeacherClassroomAssignment** - Staff assignments
- **AttendanceRecord** - Daily check-in/out tracking
- **Schedule** - Classroom schedules
- **Activity** - Daily activities

### Communications
- **DailyReport** - Child's daily summary
- **Meal**, **NapRecord**, **DiaperRecord** - Daily tracking
- **IncidentReport** - Injury/behavior tracking
- **Message** - In-app messaging
- **Announcement** - Broadcast communications
- **NotificationQueue** - Email/SMS queue

### Financial
- **FeeStructure** - Configurable fees
- **Invoice** - Monthly billing
- **Payment** - Payment processing
- **ChildFee** - Child-specific fee assignments

### Documents & Media
- **Document** - File metadata and storage
- **Photo** - Image management
- **DocumentType** - Admin-configured document types

### Analytics
- **DailyStatistics** - Aggregated daily metrics
- **AnalyticsEvent** - Event tracking
- **AuditLog** - Change tracking for compliance

---

## 🗂️ Next.js App Structure (Updated)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Protected layout with role checking
│   │   ├── admin/
│   │   │   ├── overview/
│   │   │   ├── children/
│   │   │   ├── staff/
│   │   │   ├── classrooms/
│   │   │   ├── billing/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── analytics/
│   │   ├── teacher/
│   │   │   ├── classroom/
│   │   │   ├── attendance/
│   │   │   ├── daily-reports/
│   │   │   └── schedule/
│   │   ├── parent/
│   │   │   ├── children/
│   │   │   ├── payments/
│   │   │   ├── schedule/
│   │   │   ├── messages/
│   │   │   └── documents/
│   │   └── super-admin/
│   │       ├── tenants/
│   │       ├── analytics/
│   │       └── settings/
│   ├── (public)/
│   │   ├── page.tsx          # Marketing homepage
│   │   ├── features/
│   │   ├── pricing/
│   │   └── contact/
│   ├── api/
│   │   └── webhooks/         # Stripe webhooks
│   └── waitlist/             # Public waitlist form
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── forms/
│   │   ├── child-enrollment/
│   │   ├── daily-report/
│   │   └── multi-step/
│   ├── attendance/
│   │   ├── check-in-modal/
│   │   ├── qr-scanner/
│   │   └── attendance-grid/
│   ├── billing/
│   │   ├── invoice-list/
│   │   ├── payment-form/
│   │   └── fee-calculator/
│   ├── communications/
│   │   ├── message-thread/
│   │   ├── announcement-card/
│   │   └── notification-bell/
│   └── analytics/
│       ├── charts/
│       └── stat-cards/
├── lib/
│   ├── auth/
│   │   ├── auth-store.ts     # Zustand auth state
│   │   ├── jwt.ts            # Token management
│   │   └── guards.ts         # Route protection
│   ├── api/
│   │   ├── client.ts         # Axios/fetch wrapper
│   │   ├── endpoints/        # API endpoint functions
│   │   └── hooks/            # React Query hooks
│   ├── utils/
│   │   ├── tenant.ts         # Subdomain utilities
│   │   ├── dates.ts          # Date formatting
│   │   └── currency.ts       # Currency formatting
│   └── validations/          # Zod schemas
├── hooks/
│   ├── use-tenant.ts         # Current tenant context
│   ├── use-permissions.ts    # Role-based permissions
│   └── use-notifications.ts  # Real-time notifications
├── types/
│   └── index.ts              # Import from shared-types
└── middleware.ts             # Auth & tenant middleware
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Multi-tenant authentication system
2. Tenant registration and setup
3. User management (all roles)
4. Basic role-based routing

### Phase 2: Core Operations (Week 3-4)
5. Child enrollment and profiles
6. Classroom management
7. Basic attendance tracking
8. Teacher assignments

### Phase 3: Daily Operations (Week 5-6)
9. Daily reports system
10. Photo sharing
11. In-app messaging
12. Parent portal features

### Phase 4: Financial (Week 7-8)
13. Fee structure setup
14. Invoice generation
15. Stripe payment integration
16. Payment tracking

### Phase 5: Advanced Features (Week 9-10)
17. Waitlist management
18. Analytics dashboards
19. Document management
20. Notification system

### Phase 6: Polish & Launch (Week 11-12)
21. Performance optimization
22. Security audit
23. User acceptance testing
24. Deployment setup

---

## Common Commands

### Development
- `npm run dev` - Start all applications in development mode
- `npm run dev --filter=web` - Start only the web app
- `npm run dev --filter=api` - Start only the API
- `npm run dev --filter=docs` - Start only the docs

### Database
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed test data
- `npm run db:studio` - Open Prisma Studio

### Building & Testing
- `npm run build` - Build all applications
- `npm run lint` - Lint all applications
- `npm run test` - Run all tests
- `npm run test:e2e` - Run e2e tests
- `npm run check-types` - Type check all applications

## Environment Variables

### Backend (apps/api/.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/daycare
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
AWS_S3_BUCKET=daycare-docs
REDIS_URL=redis://localhost:6379
```

### Frontend (apps/web/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Key Conventions
- All applications use TypeScript with strict mode
- API follows RESTful conventions
- Authentication using JWT with refresh tokens
- Multi-tenant data isolation at database level
- Real-time updates using WebSockets/Server-Sent Events
- File uploads to cloud storage (S3/Azure)
- Comprehensive audit logging for compliance

## Database Schema
# TENANT AND USER MANAGEMENT

Table tenants {
  id varchar [pk]
  name varchar [not null]
  subdomain varchar [unique, not null]
  logo_url varchar
  address text [not null]
  phone varchar [not null]
  email varchar [not null]
  status enum('ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED') [default: 'TRIAL']
  plan enum('TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE') [default: 'TRIAL']
  plan_expiry timestamp
  timezone varchar [default: 'UTC']
  created_at timestamp [default: `now()`]
  updated_at timestamp
  deleted_at timestamp
}

Table tenant_settings {
  id varchar [pk]
  tenant_id varchar [ref: - tenants.id]
  business_hours jsonb
  check_in_required boolean [default: true]
  late_pickup_fee decimal
  registration_fee decimal
  currency varchar [default: 'USD']
  date_format varchar [default: 'MM/DD/YYYY']
  notification_preferences jsonb
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table users {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  email varchar [not null]
  password varchar [not null]
  first_name varchar [not null]
  last_name varchar [not null]
  phone varchar
  role enum('SUPER_ADMIN', 'DAYCARE_ADMIN', 'TEACHER', 'STAFF', 'PARENT') [not null]
  is_active boolean [default: true]
  email_verified boolean [default: false]
  avatar_url varchar
  last_login timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp
  deleted_at timestamp
  
  indexes {
    (email, tenant_id) [unique]
    tenant_id
  }
}

Table refresh_tokens {
  id varchar [pk]
  user_id varchar [ref: > users.id]
  token text [unique, not null]
  expires_at timestamp [not null]
  revoked boolean [default: false]
  created_at timestamp [default: `now()`]
}

Table password_reset_tokens {
  id varchar [pk]
  user_id varchar [ref: > users.id]
  token varchar [unique, not null]
  expires_at timestamp [not null]
  used boolean [default: false]
  created_at timestamp [default: `now()`]
}

# CHILD AND FAMILY MANAGEMENT

Table children {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  first_name varchar [not null]
  last_name varchar [not null]
  date_of_birth date [not null]
  gender enum('MALE', 'FEMALE', 'OTHER')
  profile_photo varchar
  enrollment_date date
  withdrawal_date date
  status enum('ACTIVE', 'INACTIVE', 'WAITLIST', 'WITHDRAWN') [default: 'ACTIVE']
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp
  deleted_at timestamp
  
  indexes {
    tenant_id
    status
  }
}

Table parent_child_relationships {
  id varchar [pk]
  parent_id varchar [ref: > users.id]
  child_id varchar [ref: > children.id]
  relationship enum('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER') [not null]
  is_primary boolean [default: false]
  is_emergency_contact boolean [default: true]
  can_pickup boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    (parent_id, child_id) [unique]
  }
}

Table emergency_contacts {
  id varchar [pk]
  child_id varchar [ref: > children.id]
  name varchar [not null]
  relationship varchar [not null]
  phone varchar [not null]
  email varchar
  is_authorized_pickup boolean [default: false]
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table medical_information {
  id varchar [pk]
  child_id varchar [ref: - children.id]
  blood_type varchar
  allergies text[]
  medications text[]
  medical_conditions text[]
  doctor_name varchar
  doctor_phone varchar
  hospital_preference varchar
  insurance_provider varchar
  insurance_policy_number varchar
  additional_notes text
  updated_at timestamp
}

Table immunization_records {
  id varchar [pk]
  child_id varchar [ref: > children.id]
  vaccine_name varchar [not null]
  date_administered date [not null]
  next_due_date date
  administered_by varchar
  notes text
  created_at timestamp [default: `now()`]
}

# CLASSROOM AND ENROLLMENT

Table classrooms {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  name varchar [not null]
  age_group varchar [not null]
  capacity integer [not null]
  current_enrollment integer [default: 0]
  room_number varchar
  description text
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  deleted_at timestamp
  
  indexes {
    tenant_id
  }
}

Table classroom_assignments {
  id varchar [pk]
  classroom_id varchar [ref: > classrooms.id]
  child_id varchar [ref: > children.id]
  start_date date [not null]
  end_date date
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    (classroom_id, child_id, is_active) [unique]
  }
}

Table teacher_classroom_assignments {
  id varchar [pk]
  teacher_id varchar [ref: > users.id]
  classroom_id varchar [ref: > classrooms.id]
  role enum('LEAD_TEACHER', 'ASSISTANT_TEACHER', 'SUBSTITUTE') [default: 'ASSISTANT_TEACHER']
  start_date date [not null]
  end_date date
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    (teacher_id, classroom_id, is_active)
  }
}

# ATTENDANCE TRACKING

Table attendance_records {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  classroom_id varchar [ref: > classrooms.id]
  date date [not null]
  check_in_time timestamp
  check_out_time timestamp
  checked_in_by varchar [ref: > users.id]
  checked_out_by varchar [ref: > users.id]
  status enum('PRESENT', 'ABSENT', 'LATE', 'SICK', 'VACATION') [not null]
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    (child_id, date) [unique]
    tenant_id
    date
  }
}

Table attendance_codes {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  code varchar(6) [not null]
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  expires_at timestamp
  
  indexes {
    (tenant_id, code) [unique]
  }
}

# SCHEDULING

Table schedules {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  classroom_id varchar [ref: > classrooms.id]
  date date [not null]
  start_time time [not null]
  end_time time [not null]
  created_by varchar [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    (classroom_id, date)
    tenant_id
  }
}

Table activities {
  id varchar [pk]
  schedule_id varchar [ref: > schedules.id]
  name varchar [not null]
  description text
  start_time time [not null]
  end_time time [not null]
  activity_type enum('LEARNING', 'MEAL', 'NAP', 'PLAY', 'OTHER') [not null]
  materials_needed text[]
  created_at timestamp [default: `now()`]
}

Table staff_schedules {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  staff_id varchar [ref: > users.id]
  date date [not null]
  start_time time [not null]
  end_time time [not null]
  break_start time
  break_end time
  status enum('SCHEDULED', 'CONFIRMED', 'CANCELLED') [default: 'SCHEDULED']
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    (staff_id, date)
    tenant_id
  }
}

# DAILY REPORTS AND COMMUNICATION

Table daily_reports {
  id varchar [pk]
  child_id varchar [ref: > children.id]
  classroom_id varchar [ref: > classrooms.id]
  date date [not null]
  mood enum('HAPPY', 'SAD', 'FUSSY', 'SLEEPY', 'ENERGETIC')
  created_by varchar [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    (child_id, date) [unique]
  }
}

Table meals {
  id varchar [pk]
  daily_report_id varchar [ref: > daily_reports.id]
  meal_type enum('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER') [not null]
  time timestamp [not null]
  food_items text[]
  amount_eaten enum('ALL', 'MOST', 'SOME', 'NONE')
  notes text
  created_at timestamp [default: `now()`]
}

Table nap_records {
  id varchar [pk]
  daily_report_id varchar [ref: > daily_reports.id]
  start_time timestamp [not null]
  end_time timestamp
  quality enum('GOOD', 'FAIR', 'POOR', 'NO_NAP')
  notes text
  created_at timestamp [default: `now()`]
}

Table diaper_records {
  id varchar [pk]
  daily_report_id varchar [ref: > daily_reports.id]
  time timestamp [not null]
  type enum('WET', 'SOILED', 'BOTH', 'DRY') [not null]
  notes text
  created_at timestamp [default: `now()`]
}

Table incident_reports {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  date timestamp [not null]
  incident_type enum('INJURY', 'ILLNESS', 'BEHAVIOR', 'OTHER') [not null]
  description text [not null]
  action_taken text [not null]
  reported_by varchar [ref: > users.id]
  witnessed_by varchar[]
  parent_notified boolean [default: false]
  parent_notified_at timestamp
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    child_id
  }
}

# MESSAGING AND COMMUNICATION

Table messages {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  sender_id varchar [ref: > users.id]
  subject varchar
  content text [not null]
  is_announcement boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    tenant_id
    sender_id
  }
}

Table message_recipients {
  id varchar [pk]
  message_id varchar [ref: > messages.id]
  recipient_id varchar [ref: > users.id]
  is_read boolean [default: false]
  read_at timestamp
  created_at timestamp [default: `now()`]
  
  indexes {
    (message_id, recipient_id) [unique]
    recipient_id
  }
}

Table announcements {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  title varchar [not null]
  content text [not null]
  target_audience enum('ALL', 'PARENTS', 'STAFF', 'SPECIFIC_CLASSROOMS')
  classroom_ids varchar[]
  is_urgent boolean [default: false]
  publish_at timestamp
  expire_at timestamp
  created_by varchar [ref: > users.id]
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    publish_at
  }
}

# BILLING AND PAYMENTS

Table fee_structures {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  name varchar [not null]
  description text
  amount decimal [not null]
  frequency enum('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME') [not null]
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    tenant_id
  }
}

Table child_fees {
  id varchar [pk]
  child_id varchar [ref: > children.id]
  fee_structure_id varchar [ref: > fee_structures.id]
  custom_amount decimal
  start_date date [not null]
  end_date date
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    (child_id, fee_structure_id, is_active) [unique]
  }
}

Table invoices {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  invoice_number varchar [not null]
  due_date date [not null]
  subtotal decimal [not null]
  tax_amount decimal [default: 0]
  total_amount decimal [not null]
  status enum('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED') [default: 'DRAFT']
  paid_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    (tenant_id, invoice_number) [unique]
    child_id
    status
  }
}

Table invoice_items {
  id varchar [pk]
  invoice_id varchar [ref: > invoices.id]
  description varchar [not null]
  quantity integer [default: 1]
  unit_price decimal [not null]
  total_price decimal [not null]
  fee_structure_id varchar [ref: > fee_structures.id]
  created_at timestamp [default: `now()`]
}

Table payments {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  invoice_id varchar [ref: > invoices.id]
  amount decimal [not null]
  payment_method enum('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER') [not null]
  transaction_id varchar
  stripe_payment_intent_id varchar
  status enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') [not null]
  paid_by varchar [ref: > users.id]
  notes text
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    invoice_id
  }
}

# WAITLIST MANAGEMENT

Table waitlist_entries {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_first_name varchar [not null]
  child_last_name varchar [not null]
  child_date_of_birth date [not null]
  parent_name varchar [not null]
  parent_email varchar [not null]
  parent_phone varchar [not null]
  desired_start_date date
  preferred_classroom_id varchar [ref: > classrooms.id]
  priority integer
  status enum('WAITING', 'OFFERED', 'ENROLLED', 'DECLINED', 'EXPIRED') [default: 'WAITING']
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    tenant_id
    status
    priority
  }
}

Table waitlist_offers {
  id varchar [pk]
  waitlist_entry_id varchar [ref: > waitlist_entries.id]
  offered_date timestamp [not null]
  expire_date timestamp [not null]
  classroom_id varchar [ref: > classrooms.id]
  accepted boolean
  responded_at timestamp
  created_at timestamp [default: `now()`]
}

# DOCUMENTS AND FILES

Table documents {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  uploaded_by varchar [ref: > users.id]
  document_type enum('ENROLLMENT_FORM', 'MEDICAL_FORM', 'IMMUNIZATION', 'CONSENT_FORM', 'OTHER') [not null]
  file_name varchar [not null]
  file_url varchar [not null]
  file_size integer
  mime_type varchar
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    child_id
  }
}

Table photos {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  child_id varchar [ref: > children.id]
  classroom_id varchar [ref: > classrooms.id]
  uploaded_by varchar [ref: > users.id]
  photo_url varchar [not null]
  thumbnail_url varchar
  caption text
  is_profile_photo boolean [default: false]
  is_shared_with_parents boolean [default: true]
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    child_id
  }
}

# ANALYTICS AND REPORTING

Table analytics_events {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  user_id varchar [ref: > users.id]
  event_type varchar [not null]
  event_data jsonb
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    event_type
    created_at
  }
}

Table daily_statistics {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  date date [not null]
  total_enrolled integer
  total_present integer
  total_absent integer
  total_staff_present integer
  revenue_collected decimal
  new_enrollments integer
  withdrawals integer
  created_at timestamp [default: `now()`]
  
  indexes {
    (tenant_id, date) [unique]
  }
}

# AUDIT LOG

Table audit_logs {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  user_id varchar [ref: > users.id]
  action varchar [not null]
  entity_type varchar [not null]
  entity_id varchar [not null]
  old_values jsonb
  new_values jsonb
  ip_address varchar
  user_agent text
  created_at timestamp [default: `now()`]
  
  indexes {
    tenant_id
    entity_type
    entity_id
    created_at
  }
}

# NOTIFICATIONS

Table notification_templates {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  name varchar [not null]
  type enum('EMAIL', 'SMS', 'PUSH', 'IN_APP') [not null]
  trigger_event varchar [not null]
  subject varchar
  content text [not null]
  variables text[]
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    tenant_id
    trigger_event
  }
}

Table notification_queue {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  recipient_id varchar [ref: > users.id]
  template_id varchar [ref: > notification_templates.id]
  type enum('EMAIL', 'SMS', 'PUSH', 'IN_APP') [not null]
  subject varchar
  content text [not null]
  status enum('PENDING', 'SENT', 'FAILED', 'CANCELLED') [default: 'PENDING']
  scheduled_for timestamp
  sent_at timestamp
  error_message text
  created_at timestamp [default: `now()`]
  
  indexes {
    status
    scheduled_for
  }
}

# SUBSCRIPTION AND BILLING (SAAS)

Table subscription_plans {
  id varchar [pk]
  name varchar [not null]
  description text
  price_monthly decimal [not null]
  price_yearly decimal
  max_children integer
  max_staff integer
  features jsonb
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table tenant_subscriptions {
  id varchar [pk]
  tenant_id varchar [ref: > tenants.id]
  plan_id varchar [ref: > subscription_plans.id]
  status enum('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED') [not null]
  current_period_start timestamp [not null]
  current_period_end timestamp [not null]
  stripe_subscription_id varchar
  stripe_customer_id varchar
  cancel_at_period_end boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp
  
  indexes {
    tenant_id
    status
  }
}

Table subscription_invoices {
  id varchar [pk]
  tenant_subscription_id varchar [ref: > tenant_subscriptions.id]
  amount decimal [not null]
  status enum('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE') [not null]
  stripe_invoice_id varchar
  due_date timestamp
  paid_at timestamp
  created_at timestamp [default: `now()`]
}

# Daycare Management System - Complete API Specification

## API Overview

**Base URL**: `https://{subdomain}.daycaremanager.com/api/v1`  
**Authentication**: Bearer JWT Token  
**Content-Type**: `application/json`

## Authentication Endpoints

### 1. Register Daycare (Public)
```http
POST /auth/register
Content-Type: application/json

{
  "daycareName": "Little Stars Academy",
  "subdomain": "littlestars",
  "adminFirstName": "Sarah",
  "adminLastName": "Johnson",
  "email": "sarah@littlestars.com",
  "password": "SecurePass123!",
  "phone": "+1-555-0123",
  "address": "123 Main St, Springfield, IL 62701"
}

Response: 201 Created
{
  "tenant": {
    "id": "tenant_2KtG3...",
    "name": "Little Stars Academy",
    "subdomain": "littlestars",
    "status": "TRIAL",
    "planExpiry": "2025-04-21T00:00:00Z"
  },
  "admin": {
    "id": "user_9Hj4K...",
    "email": "sarah@littlestars.com",
    "role": "DAYCARE_ADMIN"
  },
  "message": "Please check your email to verify your account"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "sarah@littlestars.com",
  "password": "SecurePass123!",
  "subdomain": "littlestars"
}

Response: 200 OK
{
  "user": {
    "id": "user_9Hj4K...",
    "email": "sarah@littlestars.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "DAYCARE_ADMIN",
    "tenantId": "tenant_2KtG3..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

### 4. Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "message": "Email verified successfully"
}
```

### 5. Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "sarah@littlestars.com",
  "subdomain": "littlestars"
}

Response: 200 OK
{
  "message": "If the email exists, a reset link has been sent"
}
```

### 6. Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

### 7. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

## User Management Endpoints

### 8. Create Staff Member
```http
POST /users/staff
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "emily.teacher@littlestars.com",
  "firstName": "Emily",
  "lastName": "Davis",
  "role": "TEACHER",
  "phone": "+1-555-0124",
  "classroomIds": ["class_7Kj9L..."]
}

Response: 201 Created
{
  "id": "user_3Lm5N...",
  "email": "emily.teacher@littlestars.com",
  "firstName": "Emily",
  "lastName": "Davis",
  "role": "TEACHER",
  "temporaryPassword": "TempPass123!",
  "message": "Staff member created. They must change password on first login."
}
```

### 9. List Users
```http
GET /users?role=TEACHER&page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "users": [
    {
      "id": "user_3Lm5N...",
      "email": "emily.teacher@littlestars.com",
      "firstName": "Emily",
      "lastName": "Davis",
      "role": "TEACHER",
      "isActive": true,
      "classrooms": ["Butterfly Room"]
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 10. Update User
```http
PUT /users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "Emily",
  "lastName": "Davis-Smith",
  "phone": "+1-555-0125"
}

Response: 200 OK
{
  "id": "user_3Lm5N...",
  "email": "emily.teacher@littlestars.com",
  "firstName": "Emily",
  "lastName": "Davis-Smith",
  "role": "TEACHER",
  "phone": "+1-555-0125"
}
```

### 11. Deactivate User
```http
DELETE /users/{userId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "User deactivated successfully"
}
```

## Child Management Endpoints

### 12. Enroll Child
```http
POST /children
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "Emma",
  "lastName": "Wilson",
  "dateOfBirth": "2020-05-15",
  "gender": "FEMALE",
  "enrollmentDate": "2025-02-01",
  "classroomId": "class_7Kj9L...",
  "parentEmail": "john.wilson@email.com",
  "parentDetails": {
    "firstName": "John",
    "lastName": "Wilson",
    "phone": "+1-555-0126",
    "relationship": "FATHER"
  },
  "medicalInfo": {
    "allergies": ["Peanuts", "Dairy"],
    "medications": [],
    "conditions": ["Mild asthma"],
    "doctorName": "Dr. Smith",
    "doctorPhone": "+1-555-0200"
  },
  "emergencyContacts": [
    {
      "name": "Jane Wilson",
      "relationship": "Mother",
      "phone": "+1-555-0127",
      "canPickup": true
    }
  ]
}

Response: 201 Created
{
  "child": {
    "id": "child_8Np4Q...",
    "firstName": "Emma",
    "lastName": "Wilson",
    "dateOfBirth": "2020-05-15",
    "age": "4 years 9 months",
    "classroom": "Butterfly Room",
    "status": "ACTIVE"
  },
  "parent": {
    "id": "user_9Pq5R...",
    "email": "john.wilson@email.com",
    "temporaryPassword": "TempPass123!"
  }
}
```

### 13. List Children
```http
GET /children?status=ACTIVE&classroom=class_7Kj9L&page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "children": [
    {
      "id": "child_8Np4Q...",
      "firstName": "Emma",
      "lastName": "Wilson",
      "age": "4 years 9 months",
      "classroom": "Butterfly Room",
      "profilePhoto": "https://storage.../emma-wilson.jpg",
      "parents": ["John Wilson", "Jane Wilson"],
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 14. Get Child Details
```http
GET /children/{childId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "child_8Np4Q...",
  "firstName": "Emma",
  "lastName": "Wilson",
  "dateOfBirth": "2020-05-15",
  "gender": "FEMALE",
  "profilePhoto": "https://storage.../emma-wilson.jpg",
  "enrollmentDate": "2025-02-01",
  "classroom": {
    "id": "class_7Kj9L...",
    "name": "Butterfly Room"
  },
  "parents": [
    {
      "id": "user_9Pq5R...",
      "name": "John Wilson",
      "email": "john.wilson@email.com",
      "phone": "+1-555-0126",
      "relationship": "FATHER"
    }
  ],
  "medicalInfo": {
    "allergies": ["Peanuts", "Dairy"],
    "medications": [],
    "conditions": ["Mild asthma"],
    "doctorName": "Dr. Smith",
    "doctorPhone": "+1-555-0200"
  },
  "emergencyContacts": [
    {
      "name": "Jane Wilson",
      "relationship": "Mother",
      "phone": "+1-555-0127",
      "canPickup": true
    }
  ]
}
```

### 15. Update Child
```http
PUT /children/{childId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "classroomId": "class_9Rt6S...",
  "medicalInfo": {
    "allergies": ["Peanuts", "Dairy", "Eggs"]
  }
}

Response: 200 OK
{
  "id": "child_8Np4Q...",
  "firstName": "Emma",
  "lastName": "Wilson",
  "classroom": "Sunshine Room",
  "message": "Child information updated successfully"
}
```

### 16. Upload Child Photo
```http
POST /children/{childId}/photo
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]

Response: 200 OK
{
  "photoUrl": "https://storage.../children/emma-wilson-2025.jpg",
  "thumbnailUrl": "https://storage.../children/emma-wilson-2025-thumb.jpg"
}
```

## Classroom Management Endpoints

### 17. Create Classroom
```http
POST /classrooms
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Butterfly Room",
  "ageGroup": "3-4 years",
  "capacity": 15,
  "roomNumber": "101",
  "description": "Our preschool room for 3-4 year olds"
}

Response: 201 Created
{
  "id": "class_7Kj9L...",
  "name": "Butterfly Room",
  "ageGroup": "3-4 years",
  "capacity": 15,
  "currentEnrollment": 0,
  "roomNumber": "101"
}
```

### 18. List Classrooms
```http
GET /classrooms?active=true
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "classrooms": [
    {
      "id": "class_7Kj9L...",
      "name": "Butterfly Room",
      "ageGroup": "3-4 years",
      "capacity": 15,
      "currentEnrollment": 12,
      "teachers": ["Emily Davis", "Sarah Miller"],
      "availableSpots": 3
    }
  ]
}
```

### 19. Assign Teacher to Classroom
```http
POST /classrooms/{classroomId}/teachers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "teacherId": "user_3Lm5N...",
  "role": "LEAD_TEACHER",
  "startDate": "2025-02-01"
}

Response: 200 OK
{
  "message": "Teacher assigned successfully",
  "assignment": {
    "teacher": "Emily Davis",
    "classroom": "Butterfly Room",
    "role": "LEAD_TEACHER"
  }
}
```

## Attendance Endpoints

### 20. Check In Child
```http
POST /attendance/check-in
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "checkInTime": "2025-02-15T08:30:00Z",
  "checkInMethod": "QR_CODE",
  "temperature": 98.6,
  "notes": "Arrived happy and ready for the day"
}

Response: 200 OK
{
  "attendanceId": "att_5Wx7Y...",
  "child": "Emma Wilson",
  "checkInTime": "8:30 AM",
  "checkedInBy": "John Wilson",
  "classroom": "Butterfly Room"
}
```

### 21. Check Out Child
```http
POST /attendance/check-out
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "attendanceId": "att_5Wx7Y...",
  "checkOutTime": "2025-02-15T17:15:00Z",
  "authorizedPickup": "user_9Pq5R..."
}

Response: 200 OK
{
  "child": "Emma Wilson",
  "checkOutTime": "5:15 PM",
  "checkedOutBy": "John Wilson",
  "totalHours": 8.75,
  "latePickup": false
}
```

### 22. Get Daily Attendance
```http
GET /attendance/daily?date=2025-02-15&classroom=class_7Kj9L
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "date": "2025-02-15",
  "classroom": "Butterfly Room",
  "summary": {
    "enrolled": 12,
    "present": 10,
    "absent": 2,
    "late": 1
  },
  "records": [
    {
      "child": "Emma Wilson",
      "status": "PRESENT",
      "checkIn": "8:30 AM",
      "checkOut": "5:15 PM",
      "totalHours": 8.75
    }
  ]
}
```

### 23. Generate QR Code for Pickup
```http
POST /attendance/qr-code
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "validUntil": "2025-02-15T18:00:00Z"
}

Response: 200 OK
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "code": "PU7K9L",
  "validUntil": "6:00 PM"
}
```

## Daily Reports Endpoints

### 24. Create Daily Report
```http
POST /daily-reports
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "date": "2025-02-15",
  "mood": "HAPPY",
  "meals": [
    {
      "type": "BREAKFAST",
      "time": "08:45",
      "foodItems": ["Oatmeal", "Banana", "Milk"],
      "amountEaten": "MOST"
    },
    {
      "type": "LUNCH",
      "time": "12:00",
      "foodItems": ["Chicken nuggets", "Carrots", "Apple juice"],
      "amountEaten": "ALL"
    }
  ],
  "naps": [
    {
      "startTime": "13:00",
      "endTime": "14:30",
      "quality": "GOOD"
    }
  ],
  "activities": [
    "Circle time - learned about colors",
    "Outdoor play - playground",
    "Art project - finger painting"
  ],
  "notes": "Emma had a great day! She was very engaged during circle time."
}

Response: 201 Created
{
  "reportId": "report_9Zx8A...",
  "child": "Emma Wilson",
  "date": "2025-02-15",
  "status": "COMPLETED",
  "sharedWithParents": true
}
```

### 25. Get Daily Report
```http
GET /daily-reports/{reportId}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "report_9Zx8A...",
  "child": {
    "name": "Emma Wilson",
    "classroom": "Butterfly Room"
  },
  "date": "2025-02-15",
  "mood": "HAPPY",
  "meals": [...],
  "naps": [...],
  "activities": [...],
  "photos": [
    {
      "url": "https://storage.../daily/emma-painting.jpg",
      "caption": "Emma's beautiful finger painting!"
    }
  ],
  "teacherNotes": "Emma had a great day!",
  "createdBy": "Emily Davis",
  "createdAt": "2025-02-15T17:30:00Z"
}
```

### 26. Add Photo to Daily Report
```http
POST /daily-reports/{reportId}/photos
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]
caption: "Emma's beautiful finger painting!"

Response: 200 OK
{
  "photoId": "photo_3Bc4D...",
  "url": "https://storage.../daily/emma-painting.jpg",
  "thumbnailUrl": "https://storage.../daily/emma-painting-thumb.jpg"
}
```

## Billing & Payment Endpoints

### 27. Create Fee Structure
```http
POST /billing/fee-structures
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Full-Time Tuition",
  "description": "Monthly tuition for full-time enrollment",
  "amount": 1200.00,
  "frequency": "MONTHLY",
  "applicableFrom": "2025-01-01"
}

Response: 201 Created
{
  "id": "fee_6Ef7G...",
  "name": "Full-Time Tuition",
  "amount": 1200.00,
  "frequency": "MONTHLY",
  "isActive": true
}
```

### 28. Assign Fees to Child
```http
POST /billing/children/{childId}/fees
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "feeStructureId": "fee_6Ef7G...",
  "startDate": "2025-02-01",
  "customAmount": null,
  "notes": "Standard full-time rate"
}

Response: 200 OK
{
  "message": "Fee assigned successfully",
  "monthlyTotal": 1200.00
}
```

### 29. Generate Invoice
```http
POST /billing/invoices
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "billingPeriod": "2025-02",
  "dueDate": "2025-02-05",
  "items": [
    {
      "description": "February Tuition",
      "amount": 1200.00
    },
    {
      "description": "Late pickup fee (Feb 10)",
      "amount": 25.00
    }
  ]
}

Response: 201 Created
{
  "invoice": {
    "id": "inv_8Hi9J...",
    "invoiceNumber": "INV-2025-0234",
    "child": "Emma Wilson",
    "totalAmount": 1225.00,
    "dueDate": "2025-02-05",
    "status": "SENT",
    "paymentUrl": "https://littlestars.daycaremanager.com/pay/inv_8Hi9J"
  }
}
```

### 30. Process Payment
```http
POST /billing/payments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "invoiceId": "inv_8Hi9J...",
  "paymentMethodId": "pm_1MqLiI2eZvKYlo2CKaC9n5Tn",
  "amount": 1225.00
}

Response: 200 OK
{
  "payment": {
    "id": "pay_4Kl5M...",
    "status": "COMPLETED",
    "amount": 1225.00,
    "processedAt": "2025-02-03T10:30:00Z",
    "transactionId": "ch_3MqLiI2eZvKYlo2C0U5N6Pd8"
  },
  "invoice": {
    "status": "PAID",
    "paidAt": "2025-02-03T10:30:00Z"
  }
}
```

### 31. Get Payment History
```http
GET /billing/children/{childId}/payments?year=2025&month=2
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "child": "Emma Wilson",
  "period": "February 2025",
  "summary": {
    "totalBilled": 1225.00,
    "totalPaid": 1225.00,
    "balance": 0.00
  },
  "payments": [
    {
      "date": "2025-02-03",
      "amount": 1225.00,
      "method": "CREDIT_CARD",
      "invoice": "INV-2025-0234",
      "status": "COMPLETED"
    }
  ]
}
```

## Communication Endpoints

### 32. Send Message
```http
POST /messages
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "recipientIds": ["user_9Pq5R..."],
  "subject": "Emma's Progress Update",
  "content": "Hi Mr. Wilson, I wanted to share that Emma did wonderfully in our math activities today!",
  "attachments": []
}

Response: 201 Created
{
  "messageId": "msg_7No8P...",
  "sentTo": 1,
  "sentAt": "2025-02-15T15:45:00Z"
}
```

### 33. Create Announcement
```http
POST /announcements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "School Closed - Presidents Day",
  "content": "Little Stars Academy will be closed on Monday, February 19th for Presidents Day.",
  "targetAudience": "ALL",
  "isUrgent": false,
  "publishAt": "2025-02-12T08:00:00Z",
  "expireAt": "2025-02-19T23:59:59Z"
}

Response: 201 Created
{
  "announcementId": "ann_9Qr0S...",
  "title": "School Closed - Presidents Day",
  "status": "SCHEDULED",
  "audienceCount": 145
}
```

### 34. Get Messages
```http
GET /messages?folder=inbox&unread=true
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "messages": [
    {
      "id": "msg_7No8P...",
      "from": "Emily Davis",
      "subject": "Emma's Progress Update",
      "preview": "Hi Mr. Wilson, I wanted to share that Emma did...",
      "isRead": false,
      "receivedAt": "2025-02-15T15:45:00Z"
    }
  ],
  "unreadCount": 3,
  "totalCount": 45
}
```

## Schedule Management Endpoints

### 35. Create Schedule
```http
POST /schedules
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "classroomId": "class_7Kj9L...",
  "date": "2025-02-16",
  "activities": [
    {
      "name": "Circle Time",
      "startTime": "09:00",
      "endTime": "09:30",
      "type": "LEARNING",
      "description": "Morning welcome and calendar time"
    },
    {
      "name": "Snack Time",
      "startTime": "10:00",
      "endTime": "10:15",
      "type": "MEAL"
    },
    {
      "name": "Nap Time",
      "startTime": "13:00",
      "endTime": "14:30",
      "type": "NAP"
    }
  ]
}

Response: 201 Created
{
  "scheduleId": "sch_5Tu6V...",
  "classroom": "Butterfly Room",
  "date": "2025-02-16",
  "activitiesCount": 8
}
```

### 36. Get Weekly Schedule
```http
GET /schedules/weekly?startDate=2025-02-12&classroomId=class_7Kj9L
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "classroom": "Butterfly Room",
  "week": "February 12-16, 2025",
  "schedules": [
    {
      "date": "2025-02-12",
      "dayOfWeek": "Monday",
      "activities": [...]
    }
  ]
}
```

## Waitlist Endpoints

### 37. Join Waitlist
```http
POST /waitlist
Content-Type: application/json

{
  "childFirstName": "Lucas",
  "childLastName": "Brown",
  "childDateOfBirth": "2021-08-20",
  "parentName": "Maria Brown",
  "parentEmail": "maria.brown@email.com",
  "parentPhone": "+1-555-0128",
  "desiredStartDate": "2025-09-01",
  "preferredClassroom": "Toddler Room",
  "notes": "Looking for full-time care starting Fall 2025"
}

Response: 201 Created
{
  "waitlistId": "wait_8Wx9Y...",
  "position": 12,
  "estimatedAvailability": "6-8 months",
  "message": "You've been added to our waitlist. We'll contact you when a spot becomes available."
}
```

### 38. Check Waitlist Status
```http
GET /waitlist/{waitlistId}/status
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "childName": "Lucas Brown",
  "currentPosition": 8,
  "originalPosition": 12,
  "addedDate": "2025-01-15",
  "movement": "Moved up 4 positions",
  "estimatedAvailability": "3-4 months"
}
```

## Analytics Endpoints

### 39. Dashboard Statistics
```http
GET /analytics/dashboard
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "overview": {
    "totalEnrolled": 145,
    "presentToday": 132,
    "totalStaff": 24,
    "occupancyRate": 92.5
  },
  "financial": {
    "monthlyRevenue": 174000.00,
    "outstandingBalance": 4500.00,
    "collectionRate": 97.4
  },
  "trends": {
    "enrollmentTrend": "+5.2%",
    "revenueTrend": "+8.1%"
  }
}
```

### 40. Enrollment Report
```http
GET /analytics/enrollment?startDate=2025-01-01&endDate=2025-02-15
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "period": "Jan 1 - Feb 15, 2025",
  "summary": {
    "newEnrollments": 12,
    "withdrawals": 3,
    "netGrowth": 9
  },
  "byClassroom": [
    {
      "classroom": "Butterfly Room",
      "enrolled": 12,
      "capacity": 15,
      "utilizationRate": 80.0
    }
  ],
  "byAgeGroup": [
    {
      "ageGroup": "3-4 years",
      "count": 45,
      "percentage": 31.0
    }
  ]
}
```

### 41. Financial Report
```http
GET /analytics/financial?year=2025&month=2
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "period": "February 2025",
  "revenue": {
    "tuition": 168000.00,
    "registrationFees": 3000.00,
    "lateFees": 450.00,
    "otherFees": 2550.00,
    "total": 174000.00
  },
  "outstanding": {
    "current": 2000.00,
    "overdue30Days": 1500.00,
    "overdue60Days": 1000.00,
    "total": 4500.00
  },
  "projections": {
    "nextMonth": 176000.00,
    "quarterly": 528000.00
  }
}
```

## Document Management Endpoints

### 42. Upload Document
```http
POST /documents
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

childId: child_8Np4Q...
documentType: IMMUNIZATION
file: [binary data]
description: Updated immunization record - February 2025

Response: 201 Created
{
  "documentId": "doc_6Yz7A...",
  "fileName": "emma-wilson-immunization-2025.pdf",
  "fileSize": 245632,
  "uploadedAt": "2025-02-15T10:30:00Z",
  "uploadedBy": "Sarah Johnson"
}
```

### 43. List Child Documents
```http
GET /children/{childId}/documents
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "documents": [
    {
      "id": "doc_6Yz7A...",
      "type": "IMMUNIZATION",
      "fileName": "emma-wilson-immunization-2025.pdf",
      "uploadedDate": "2025-02-15",
      "uploadedBy": "Sarah Johnson",
      "fileSize": "240 KB",
      "downloadUrl": "https://storage.../documents/doc_6Yz7A..."
    }
  ]
}
```

## Settings Endpoints

### 44. Get Tenant Settings
```http
GET /settings/tenant
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "tenant": {
    "id": "tenant_2KtG3...",
    "name": "Little Stars Academy",
    "subdomain": "littlestars",
    "logo": "https://storage.../logos/littlestars.png",
    "timezone": "America/Chicago"
  },
  "businessHours": {
    "monday": { "open": "07:00", "close": "18:00" },
    "tuesday": { "open": "07:00", "close": "18:00" },
    "wednesday": { "open": "07:00", "close": "18:00" },
    "thursday": { "open": "07:00", "close": "18:00" },
    "friday": { "open": "07:00", "close": "18:00" },
    "saturday": { "closed": true },
    "sunday": { "closed": true }
  },
  "fees": {
    "registrationFee": 250.00,
    "latePickupFee": 25.00,
    "latePaymentFee": 35.00
  },
  "policies": {
    "checkInRequired": true,
    "autoLogoutMinutes": 30,
    "requirePhotoId": true,
    "allowParentPhotos": true
  }
}
```

### 45. Update Tenant Settings
```http
PUT /settings/tenant
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "businessHours": {
    "monday": { "open": "06:30", "close": "18:30" }
  },
  "fees": {
    "latePickupFee": 30.00
  }
}

Response: 200 OK
{
  "message": "Settings updated successfully",
  "updatedFields": ["businessHours.monday", "fees.latePickupFee"]
}
```

### 46. Upload Logo
```http
POST /settings/logo
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]

Response: 200 OK
{
  "logoUrl": "https://storage.../logos/littlestars-2025.png",
  "message": "Logo updated successfully"
}
```

## Staff Management Endpoints

### 47. Create Staff Schedule
```http
POST /staff/schedules
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "staffId": "user_3Lm5N...",
  "schedules": [
    {
      "date": "2025-02-19",
      "startTime": "08:00",
      "endTime": "16:30",
      "breakStart": "12:00",
      "breakEnd": "12:30"
    },
    {
      "date": "2025-02-20",
      "startTime": "08:00",
      "endTime": "16:30",
      "breakStart": "12:00",
      "breakEnd": "12:30"
    }
  ]
}

Response: 201 Created
{
  "message": "Schedule created successfully",
  "scheduledDays": 2,
  "totalHours": 16.0
}
```

### 48. Get Staff Schedule
```http
GET /staff/{staffId}/schedule?startDate=2025-02-19&endDate=2025-02-23
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "staff": "Emily Davis",
  "period": "Feb 19-23, 2025",
  "totalScheduledHours": 40.0,
  "schedule": [
    {
      "date": "2025-02-19",
      "dayOfWeek": "Monday",
      "shift": "8:00 AM - 4:30 PM",
      "break": "12:00 PM - 12:30 PM",
      "classroom": "Butterfly Room",
      "status": "SCHEDULED"
    }
  ]
}
```

### 49. Clock In/Out
```http
POST /staff/timeclock
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "CLOCK_IN",
  "timestamp": "2025-02-19T07:58:00Z",
  "location": {
    "latitude": 39.7392,
    "longitude": -104.9903
  }
}

Response: 200 OK
{
  "action": "CLOCK_IN",
  "recordedTime": "7:58 AM",
  "scheduledTime": "8:00 AM",
  "status": "ON_TIME",
  "message": "Clocked in successfully"
}
```

## Incident & Health Endpoints

### 50. Report Incident
```http
POST /incidents
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "incidentType": "INJURY",
  "dateTime": "2025-02-15T14:30:00Z",
  "location": "Playground",
  "description": "Emma fell from the swing and scraped her knee",
  "injuryDetails": {
    "bodyPart": "Right knee",
    "injuryType": "Scrape",
    "severity": "MINOR"
  },
  "actionTaken": "Cleaned the scrape, applied bandage, comforted child",
  "witnessedBy": ["user_3Lm5N...", "user_4Op6Q..."],
  "parentNotified": true,
  "parentNotifiedAt": "2025-02-15T14:45:00Z",
  "parentResponse": "Thanked for notification, no further action needed"
}

Response: 201 Created
{
  "incidentId": "inc_7Ab8C...",
  "reportNumber": "INC-2025-0034",
  "status": "REPORTED",
  "requiresFollowUp": false
}
```

### 51. Health Check Records
```http
POST /health-checks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "date": "2025-02-15",
  "temperature": 98.6,
  "symptoms": [],
  "medicationGiven": false,
  "notes": "Child appears healthy and happy"
}

Response: 201 Created
{
  "healthCheckId": "hc_9Cd0E...",
  "status": "HEALTHY",
  "requiresMonitoring": false
}
```

### 52. Medication Administration
```http
POST /medications/administer
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "medicationName": "Children's Tylenol",
  "dosage": "5ml",
  "administeredAt": "2025-02-15T11:00:00Z",
  "reason": "Mild headache",
  "administeredBy": "user_3Lm5N...",
  "parentAuthorization": "auth_5Fg6H..."
}

Response: 201 Created
{
  "recordId": "med_2Ij3K...",
  "logged": true,
  "parentNotified": true
}
```

## Reports Generation Endpoints

### 53. Generate Attendance Report
```http
POST /reports/attendance
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reportType": "MONTHLY",
  "month": "2025-02",
  "classroomId": "class_7Kj9L...",
  "format": "PDF"
}

Response: 202 Accepted
{
  "reportId": "rpt_4Lm5N...",
  "status": "PROCESSING",
  "estimatedTime": "2-3 minutes",
  "downloadUrl": "https://littlestars.daycaremanager.com/reports/rpt_4Lm5N..."
}
```

### 54. Generate Financial Statement
```http
POST /reports/financial-statement
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "year": 2025,
  "includeDetails": true
}

Response: 202 Accepted
{
  "reportId": "rpt_6Op7Q...",
  "status": "PROCESSING",
  "childName": "Emma Wilson",
  "year": 2025,
  "downloadUrl": "https://littlestars.daycaremanager.com/reports/rpt_6Op7Q..."
}
```

## Parent Portal Specific Endpoints

### 55. Parent Dashboard
```http
GET /parent/dashboard
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "children": [
    {
      "id": "child_8Np4Q...",
      "name": "Emma Wilson",
      "classroom": "Butterfly Room",
      "checkedIn": true,
      "todaysSummary": {
        "mood": "HAPPY",
        "meals": "Ate well",
        "nap": "1.5 hours",
        "highlights": "Enjoyed art project"
      }
    }
  ],
  "upcomingEvents": [
    {
      "date": "2025-02-19",
      "event": "School Closed - Presidents Day"
    }
  ],
  "outstandingBalance": 0.00,
  "unreadMessages": 2
}
```

### 56. Request Absence
```http
POST /parent/absence-request
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childId": "child_8Np4Q...",
  "dates": ["2025-02-22", "2025-02-23"],
  "reason": "Family vacation",
  "notes": "Emma will be out Friday and Monday for a family trip"
}

Response: 201 Created
{
  "requestId": "abs_8Rs9T...",
  "status": "APPROVED",
  "message": "Absence request recorded. Have a great trip!"
}
```

### 57. Update Emergency Contacts
```http
PUT /parent/children/{childId}/emergency-contacts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contacts": [
    {
      "name": "Jane Wilson",
      "relationship": "Mother",
      "phone": "+1-555-0127",
      "canPickup": true
    },
    {
      "name": "Robert Wilson",
      "relationship": "Grandfather",
      "phone": "+1-555-0129",
      "canPickup": true
    }
  ]
}

Response: 200 OK
{
  "message": "Emergency contacts updated successfully",
  "totalContacts": 2
}
```

## Admin/Platform Management Endpoints

### 58. Platform Statistics (Super Admin)
```http
GET /platform/statistics
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "platform": {
    "totalTenants": 156,
    "activeSubscriptions": 142,
    "totalChildren": 8945,
    "totalUsers": 12456,
    "monthlyRecurringRevenue": 98400.00
  },
  "growth": {
    "newTenantsThisMonth": 12,
    "churnRate": 2.1,
    "netGrowth": 8.5
  },
  "usage": {
    "dailyActiveUsers": 8234,
    "averageSessionLength": "18.5 minutes",
    "topFeatures": [
      "Daily Reports",
      "Attendance Tracking",
      "Parent Communication"
    ]
  }
}
```

### 59. Manage Tenant Subscription
```http
PUT /platform/tenants/{tenantId}/subscription
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "plan": "PREMIUM",
  "billingCycle": "ANNUAL",
  "customPrice": 8400.00,
  "notes": "Annual discount applied"
}

Response: 200 OK
{
  "tenant": "Little Stars Academy",
  "previousPlan": "BASIC",
  "newPlan": "PREMIUM",
  "effectiveDate": "2025-03-01",
  "nextBillingDate": "2026-03-01",
  "amount": 8400.00
}
```

### 60. Export Data
```http
POST /export/data
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "exportType": "GDPR_REQUEST",
  "format": "JSON",
  "scope": {
    "children": true,
    "attendance": true,
    "billing": true,
    "communications": true
  },
  "dateRange": {
    "start": "2024-01-01",
    "end": "2025-02-15"
  }
}

Response: 202 Accepted
{
  "exportId": "exp_9Uv0W...",
  "status": "PROCESSING",
  "estimatedSize": "25 MB",
  "expiresAt": "2025-02-22T00:00:00Z",
  "message": "Export will be available for download within 30 minutes"
}
```

## Webhooks

### Webhook Events
```javascript
// Payment Completed
{
  "event": "payment.completed",
  "timestamp": "2025-02-15T10:30:00Z",
  "data": {
    "paymentId": "pay_4Kl5M...",
    "invoiceId": "inv_8Hi9J...",
    "amount": 1225.00,
    "childId": "child_8Np4Q...",
    "tenantId": "tenant_2KtG3..."
  }
}

// Child Checked In
{
  "event": "attendance.checkin",
  "timestamp": "2025-02-15T08:30:00Z",
  "data": {
    "childId": "child_8Np4Q...",
    "time": "2025-02-15T08:30:00Z",
    "method": "QR_CODE",
    "tenantId": "tenant_2KtG3..."
  }
}

// Waitlist Spot Available
{
  "event": "waitlist.spot_available",
  "timestamp": "2025-02-15T14:00:00Z",
  "data": {
    "waitlistId": "wait_8Wx9Y...",
    "position": 1,
    "classroomId": "class_7Kj9L...",
    "tenantId": "tenant_2KtG3..."
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2025-02-15T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `CONFLICT` - Resource already exists
- `PAYMENT_REQUIRED` - Subscription expired
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- **Authenticated requests**: 1000 per hour
- **Authentication endpoints**: 20 per hour
- **File uploads**: 100 per hour
- **Report generation**: 10 per hour

## API Versioning

- Current version: v1
- Version included in URL path
- Deprecation notice: 6 months
- Sunset period: 12 months

This completes the comprehensive API specification for the daycare management system. All endpoints follow RESTful conventions and include proper authentication, validation, and error handling.