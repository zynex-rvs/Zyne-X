"use server";

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// We create a server-side client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function registerUser(data: any) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("regNo")
      .eq("regNo", data.regNo.toUpperCase())
      .single();

    if (existingUser) {
      return { error: "This Register Number is already registered." };
    }

    // Hash the password securely (10 rounds is standard)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = {
      regNo: data.regNo.toUpperCase(),
      name: data.name.toUpperCase(),
      email: data.email.toLowerCase(),
      mobile: data.mobile,
      department: data.department,
      year: data.year,
      role: "member",
      password: hashedPassword, // Store hash, not plaintext!
      image: data.image || null, // Image should already be a Cloudinary URL
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert(newUser)
      .select()
      .single();
    
    if (insertError) {
      return { error: insertError.message };
    }

    // Return success (we omit password from the returned object for security)
    const { password, ...safeUser } = insertedUser;
    return { user: safeUser };

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function loginUser(regNo: string, pass: string) {
  try {
    // 1. Fetch user by regNo
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .ilike("regNo", regNo.trim())
      .single();

    if (error || !user) {
      return { error: "wrong password or wrong register number" };
    }

    // 2. Compare passwords
    // Note: Since the database currently has plaintext passwords for 24 test users,
    // this bcrypt.compare will FAIL for those users. They must register again or we reset them.
    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      // Fallback for legacy plaintext passwords (only for migration purposes, remove in production!)
      // If we don't want a fallback, we just return error.
      if (pass !== user.password) {
        return { error: "wrong password or wrong register number" };
      } else {
        console.warn("LEGACY PLAINTEXT LOGIN USED for", regNo);
      }
    }

    // 3. Return user (omit password)
    const { password: _, ...safeUser } = user;
    return { user: safeUser };

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
