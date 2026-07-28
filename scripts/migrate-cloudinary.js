const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!supabaseUrl || !supabaseKey || !cloudName || !uploadPreset) {
  console.error("Missing environment variables. Please check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadToCloudinary(base64Image) {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Image,
        upload_preset: uploadPreset
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Cloudinary error:", err);
      return null;
    }

    const data = await response.json();
    // Add compression transformations
    return data.secure_url.replace("/upload/", "/upload/w_500,h_500,c_limit,q_auto,f_auto/");
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    return null;
  }
}

async function migrateTable(tableName, idField = "id") {
  console.log(`\n--- Migrating table: ${tableName} ---`);
  
  // Fetch all records that have an image field starting with "data:image/"
  const { data: records, error } = await supabase.from(tableName).select("*");
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }

  const recordsToUpdate = records.filter(r => r.image && r.image.startsWith("data:image/"));
  console.log(`Found ${recordsToUpdate.length} records in ${tableName} to migrate.`);

  let successCount = 0;
  for (const record of recordsToUpdate) {
    console.log(`Uploading image for record ID: ${record[idField]}...`);
    const newUrl = await uploadToCloudinary(record.image);
    
    if (newUrl) {
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ image: newUrl })
        .eq(idField, record[idField]);

      if (updateError) {
        console.error(`Failed to update DB for record ID: ${record[idField]}`, updateError);
      } else {
        console.log(`Successfully migrated record ID: ${record[idField]}`);
        successCount++;
      }
    }
  }

  console.log(`Completed ${tableName}: ${successCount}/${recordsToUpdate.length} migrated successfully.`);
}

async function runMigration() {
  console.log("Starting Cloudinary Migration Script...");
  
  // Tables known to contain images
  await migrateTable("users");
  await migrateTable("events");
  await migrateTable("clubs");
  await migrateTable("administrators");
  await migrateTable("nexaura_administrators");
  await migrateTable("announcements");

  console.log("\nMigration completed completely!");
  process.exit(0);
}

runMigration();
