const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY // service role, not anon key, for server-side uploads
);

async function uploadToSupabase(file, bucketName) {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucketName) // "audio" or "cover" — was hardcoded to "your-bucket-name" before, always failed
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  return data.path; // this is your "key" to store in coverKey/audioKey
}

module.exports = { supabase, uploadToSupabase };