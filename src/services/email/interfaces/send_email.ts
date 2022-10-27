export class ISendEmail {
  from?: string;
  to: string[];
  cc?: string[] = [];
  subject: string;
  templateName: string;
  context?: any = {};
}
