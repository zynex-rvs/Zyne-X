import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const sendReplySchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
  subject: z.string().optional(),
  replyMessage: z.string().min(1, 'Reply message cannot be empty'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = sendReplySchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues?.[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, name, subject, replyMessage } = result.data;

    // Configure Nodemailer (using same SMTP setup as OTP service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
      },
    });

    // Format the email using a clean HTML template
    const mailOptions = {
      from: `"ZYNE-X Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Re: ${subject || 'Your Enquiry'} - ZYNE-X`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
          <h2 style="color: #0ea5e9;">ZYNE-X Support</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${name || 'Candidate'},</p>
          <p style="color: #334155; font-size: 16px;">Thank you for reaching out to us. We have received your enquiry regarding <strong>"${subject || 'General Enquiry'}"</strong>.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0ea5e9; border-radius: 4px; margin: 20px 0;">
            <p style="color: #334155; font-size: 15px; margin: 0; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          
          <p style="color: #334155; font-size: 15px;">If you have any further questions, feel free to reply to this email or submit a new enquiry.</p>
          <br/>
          <p style="color: #334155; font-size: 15px;">Best regards,<br/><strong>The ZYNE-X Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This email was sent by the ZYNE-X Admin Team.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Reply sent successfully' });
  } catch (error: any) {
    console.error('Send Reply Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
