import type { NotificationType, NotificationTemplate } from '@repo/shared-types';

export interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

export interface SMSService {
  sendSMS(to: string, message: string): Promise<void>;
}

export class SendGridEmailService implements EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY!;
    if (!this.apiKey) {
      throw new Error('SENDGRID_API_KEY is required');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: process.env.FROM_EMAIL || 'noreply@daycare-platform.com',
          name: 'Daycare Platform',
        },
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  }
}

export class TwilioSMSService implements SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER!;

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials are required');
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: this.fromNumber,
        To: to,
        Body: message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
  }
}

export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;

  constructor() {
    this.emailService = new SendGridEmailService();
    this.smsService = new TwilioSMSService();
  }

  async sendNotification(
    type: NotificationType,
    template: NotificationTemplate,
    variables: Record<string, string>,
    recipients: {
      email?: string;
      phone?: string;
      preferences: { email: boolean; sms: boolean };
    }[]
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const recipient of recipients) {
      // Send email if enabled
      if (recipient.preferences.email && recipient.email) {
        const emailContent = this.processTemplate(template.emailTemplate, variables);
        const subject = this.processTemplate(template.subject, variables);
        
        promises.push(
          this.emailService.sendEmail(recipient.email, subject, emailContent)
        );
      }

      // Send SMS if enabled
      if (recipient.preferences.sms && recipient.phone) {
        const smsContent = this.processTemplate(template.smsTemplate, variables);
        
        promises.push(
          this.smsService.sendSMS(recipient.phone, smsContent)
        );
      }
    }

    await Promise.all(promises);
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return processed;
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}