import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must only contain numbers'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues?.[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, otp, newPassword } = result.data;

    // 1. Find the OTP in the database
    const { data: otpData, error: otpError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // 2. Check if the OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // 3. OTP is valid, update the password in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', email);

    if (updateError) {
      console.error('Password Update Error:', updateError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // 4. Delete the OTP so it can't be reused
    await supabase
      .from('otps')
      .delete()
      .eq('id', otpData.id);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
