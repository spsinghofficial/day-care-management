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
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword, // This should be an App Password, not your regular password
        },
      });
    } else if (emailProvider === 'smtp') {
      // Generic SMTP configuration for other providers
      this.transporter = nodemailer.createTransporter({
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
}