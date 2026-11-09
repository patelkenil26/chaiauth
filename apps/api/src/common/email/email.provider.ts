import { Resend } from "resend";
import { logger } from "@repo/logger";
import { config } from "../config/env.config";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/** Transport abstraction: swap Resend for SES/SMTP without touching any caller. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send({ to, subject, html }: EmailMessage): Promise<void> {
    const { data, error } = await this.client.emails.send({ from: this.from, to, subject, html });
    if (error) {
      logger.error("Resend API error", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }
    logger.info("Email sent", { id: data?.id, subject });
  }
}

/** Dev fallback when no API key is configured: log instead of sending. */
class ConsoleEmailProvider implements EmailProvider {
  async send({ to, subject }: EmailMessage): Promise<void> {
    logger.warn(`[email:console] RESEND_API_KEY not set. Would send "${subject}" to ${to}`);
  }
}

export const emailProvider: EmailProvider = config.email.resendApiKey
  ? new ResendEmailProvider(config.email.resendApiKey, config.email.from)
  : new ConsoleEmailProvider();
