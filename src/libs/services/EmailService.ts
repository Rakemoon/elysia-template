import { createTransport } from "nodemailer";
import type { SentMessageInfo } from "nodemailer";
import type Logging from "#components/Logging";
import { email } from "#constants/env";
import { CatchAllError } from "#decorators/index";
import Service from "#structures/Service";

@CatchAllError
export default class EmailService extends Service {
    public static transport = createTransport(email.smtp);
    public static async initTransport(log: Logging): Promise<void> {
        try {
            await this.transport.verify();
            log.info("Connected to Email server!");
        } catch {
            log.error("Unable to connect to email server.");
        }
    }

    public async sendMail(to: string, subject: string, text: string): Promise<SentMessageInfo> {
        return EmailService.transport.sendMail({
            from: email.from,
            to,
            subject,
            text
        });
    }

    public async sendVerificationMail(to: string, link: string, token: string): Promise<SentMessageInfo> {
        return this.sendMail(
            to,
            "Verification Email",
            `Dear user,
To verify your email, click on this link: ${link.replace("$TOKEN", token)}`
        );
    }

    public async sendForgotPasswordMail(to: string, link: string, token: string): Promise<SentMessageInfo> {
        return this.sendMail(
            to,
            "Forgot Password Email",
            `Dear User,
To reset password, click on this link: ${link.replace("$TOKEN", token)}
`
        );
    }
}
