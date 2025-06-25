import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'gmail';
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (!emailUser || !emailPassword) {
      this.logger.warn('Email credentials not configured. Emails will be logged to console.');
      return;
    }

    if (emailProvider === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword, // This should be an App Password, not your regular password
        },
      });
    } else if (emailProvider === 'smtp') {
      // Generic SMTP configuration for other providers
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    }
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Email would be sent:', template.subject);
      // In development, just log the email instead of sending
      console.log('===== EMAIL WOULD BE SENT =====');
      console.log('To:', template.to);
      console.log('Subject:', template.subject);
      console.log('Content:', template.text || template.html);
      console.log('===============================');
      return true;
    }

    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER'),
        to: template.to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${template.to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${template.to}:`, error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const template: EmailTemplate = {
      to: email,
      subject: 'Verify Your Email Address - Daycare Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Daycare Manager, ${firstName}!</h2>
          <p>Thank you for registering your daycare with us. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
        Welcome to Daycare Manager, ${firstName}!
        
        Thank you for registering your daycare with us. To complete your registration, please verify your email address by visiting:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create this account, you can safely ignore this email.
      `
    };

    return this.sendEmail(template);
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string, baseUrl: string): Promise<boolean> {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const template: EmailTemplate = {
      to: email,
      subject: 'Reset Your Password - Daycare Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p>This reset link will expire in 1 hour.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hello ${firstName},
        
        We received a request to reset your password. Visit this link to create a new password:
        
        ${resetUrl}
        
        This reset link will expire in 1 hour.
        
        If you didn't request this password reset, you can safely ignore this email.
      `
    };

    return this.sendEmail(template);
  }

  async sendStaffInvitationEmail(
    email: string, 
    firstName: string, 
    invitationToken: string, 
    baseUrl: string,
    inviterName: string,
    daycareOrganization: string
  ): Promise<boolean> {
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    
    const template: EmailTemplate = {
      to: email,
      subject: `You're invited to join ${daycareOrganization} - Daycare Manager`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're Invited to Join ${daycareOrganization}!</h2>
          <p>Hello ${firstName},</p>
          <p>${inviterName} has invited you to join ${daycareOrganization} using Daycare Manager.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p>By accepting this invitation, you'll be able to:</p>
          <ul>
            <li>Access your daycare management dashboard</li>
            <li>Manage children and attendance</li>
            <li>Communicate with parents</li>
            <li>Create daily reports</li>
          </ul>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
          
          <p><strong>Important:</strong> This invitation will expire in 72 hours. Please accept it soon to start using your account.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
        You're Invited to Join ${daycareOrganization}!
        
        Hello ${firstName},
        
        ${inviterName} has invited you to join ${daycareOrganization} using Daycare Manager.
        
        To accept this invitation and set up your account, visit:
        ${invitationUrl}
        
        By accepting this invitation, you'll be able to:
        - Access your daycare management dashboard
        - Manage children and attendance
        - Communicate with parents
        - Create daily reports
        
        Important: This invitation will expire in 72 hours.
        
        If you weren't expecting this invitation, you can safely ignore this email.
      `
    };

    return this.sendEmail(template);
  }

  async sendParentWelcomeEmail(
    email: string, 
    firstName: string, 
    temporaryPassword: string,
    verificationToken: string, 
    baseUrl: string
  ): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const template: EmailTemplate = {
      to: email,
      subject: 'Welcome to Daycare Manager - Your Child Has Been Enrolled!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Daycare Manager, ${firstName}!</h2>
          <p>Your child has been successfully enrolled in our daycare program. We've created a parent account for you to stay connected with your child's daily activities.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Account Details:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
          </div>
          
          <p><strong>Important:</strong> Please verify your email address and change your password after your first login.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email & Get Started
            </a>
          </div>
          
          <p>With your parent account, you'll be able to:</p>
          <ul>
            <li>View your child's daily reports and activities</li>
            <li>See photos from their day</li>
            <li>Check in/out your child digitally</li>
            <li>Communicate with teachers and staff</li>
            <li>View and pay invoices online</li>
            <li>Update your child's information</li>
          </ul>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            If you have any questions, please contact us. We're excited to have your family as part of our daycare community!
          </p>
        </div>
      `,
      text: `
        Welcome to Daycare Manager, ${firstName}!
        
        Your child has been successfully enrolled in our daycare program. We've created a parent account for you to stay connected with your child's daily activities.
        
        Your Account Details:
        Email: ${email}
        Temporary Password: ${temporaryPassword}
        
        Important: Please verify your email address and change your password after your first login.
        
        To verify your email and get started, visit:
        ${verificationUrl}
        
        With your parent account, you'll be able to:
        - View your child's daily reports and activities
        - See photos from their day
        - Check in/out your child digitally
        - Communicate with teachers and staff
        - View and pay invoices online
        - Update your child's information
        
        This verification link will expire in 24 hours.
        
        If you have any questions, please contact us. We're excited to have your family as part of our daycare community!
      `
    };

    return this.sendEmail(template);
  }
}