import { CatchAllError } from "#decorators/index";
import Service from "#structures/Service";
import { createTransport } from "nodemailer";
import { email } from "#constants/env";
import type Logging from "#components/Logging";

@CatchAllError
export default class EmailService extends Service {
  public static transport = createTransport(email.smtp);
  public static async initTransport(log: Logging) {
    try {
      await this.transport.verify();
      log.info("Connected to Email server!");
    } catch(e) {
      log.error("Unable to connect to email server.");
    }
  }

  public async sendMail(to: string, subject: string, text: string) {
    return EmailService.transport.sendMail({
      from: email.from,
      to,
      subject,
      text
    });
  }

  public async sendVerificationMail(to: string, link: string, token: string) {
    return this.sendMail(
      to,
      "Verification Email",
      `Dear user,
To verify your email, click on this link: ${link.replace("$TOKEN", token)}`
    );
  }

  public async sendForgotPasswordMail(to: string, link: string, token: string) {
    return this.sendMail(
      to,
      "Forgot Password Email",
      `Dear User,
To reset password, click on this link: ${link.replace("$TOKEN", token)}
`
    );
  }
}
