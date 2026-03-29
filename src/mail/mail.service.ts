import { Injectable, Inject, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { DB_CONNECTION, type DrizzleDB } from '../db/db.module';
import { storeSettings, emailTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(DB_CONNECTION) private readonly db: DrizzleDB,
  ) {}

  private async getTransporter() {
    const settings = await this.db.select().from(storeSettings);
    const host = settings.find(s => s.key === 'smtp_host')?.value;
    const user = settings.find(s => s.key === 'smtp_user')?.value;
    const pass = settings.find(s => s.key === 'smtp_pass')?.value; // Note: We should ensure smtp_pass exists in integration
    const port = settings.find(s => s.key === 'smtp_port')?.value || '587';
    const from = settings.find(s => s.key === 'smtp_from')?.value || user;

    if (!host || !user) {
      this.logger.warn('SMTP settings are incomplete. Mail service is idle.');
      return null;
    }

    return {
      transporter: nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: port === '465',
        auth: {
          user,
          pass,
        },
      }),
      from,
    };
  }

  async sendTemplateEmail(to: string, templateName: string, data: Record<string, string>) {
    try {
      const [template] = await this.db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.name, templateName));

      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      const client = await this.getTransporter();
      if (!client) return;

      let { subject, body } = template;

      // Replace placeholders
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      const info = await client.transporter.sendMail({
        from: client.from,
        to,
        subject,
        html: body,
      });

      this.logger.log(`Email sent: ${info.messageId} to ${to} (Template: ${templateName})`);
      return info;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new InternalServerErrorException('Mail delivery failed');
    }
  }

  async testConnection(to: string) {
    const client = await this.getTransporter();
    if (!client) throw new Error('SMTP settings missing');

    const info = await client.transporter.sendMail({
      from: client.from,
      to,
      subject: 'Store Integration Test',
      text: 'If you see this, your SMTP settings are working correctly!',
    });
    return info;
  }
}
