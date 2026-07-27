import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const sendForgotOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = sendForgotOtpSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues?.[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email } = result.data;

    // 1. Check if user exists in the database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, name')
      .eq('email', email)
      .single();

    if (checkError || !existingUser) {
      // Even if user doesn't exist, we can return an error here to inform them.
      // (For strict security against enumeration, we might pretend it succeeded, but for a club app, error is fine)
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save OTP to Supabase
    const { error: dbError } = await supabase
      .from('otps')
      .insert([{ email, otp }]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // 4. Send the Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"ZYNE-X Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'ZYNE-X - Password Reset Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
          <h2 style="color: #0ea5e9; text-align: center;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${existingUser.name || 'Member'},</p>
          <p style="color: #334155; font-size: 16px;">We received a request to reset your password. Use the code below to proceed.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background-color: #e0f2fe; padding: 15px 25px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Password reset OTP sent successfully' });
  } catch (error: any) {
    console.error('Forgot Password Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
