import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save OTP to Supabase
    // Note: We assume the 'otps' table has been created using the provided SQL script
    const { error: dbError } = await supabase
      .from('otps')
      .insert([{ email, otp }]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // 3. Configure Nodemailer (using Gmail as an example)
    // Make sure SMTP_USER and SMTP_PASS are set in .env.local
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // This must be an App Password, not the regular account password
      },
    });

    // 4. Send the Email
    const mailOptions = {
      from: `"ZYNE-X Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'ZYNE-X - Your Registration Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
          <h2 style="color: #0ea5e9; text-align: center;">ZYNE-X Verification</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${name || 'Candidate'},</p>
          <p style="color: #334155; font-size: 16px;">Please use the following 6-digit code to verify your email address and complete your registration.</p>
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

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
