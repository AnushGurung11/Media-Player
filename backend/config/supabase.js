// Main configuration file for Supabase client setup and file upload functionality
const { createClient } = require("@supabase/supabase-js");

//  Supabase client is initialized using environment variables for URL and secret key
const supabase = createClient(
  // This process.env then . will refer to the env file variables
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY 
);


// Uploads a file to a specified Supabase storage bucket and returns the file path

//  Using of async function here alows us to continue the other task without waiting for the upload to complete. 
/**
 * Uploads a file to a specified Supabase storage bucket and returns the file path
 * @param {Object} file - The file object to upload
 * @param {string} bucketName - The name of the storage bucket
 * @returns {Promise<string>} - The path of the uploaded file
 */
async function uploadToSupabase(file, bucketName) {

  // Here the function originalname will take the original name and then will split the name if there is '.' then the last part will be the extension of the file.
  const fileExt = file.originalname.split(".").pop();

  // To avoide duplication of the file name we use the time stamp and ater we use the random string generator to generate a random string and then we will use the file extension to create a unique file name.
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  // we have here 2 parameters the first one is the bucket name and the second one is the file name and then we will use the upload method to upload the file to the supabase storage. 
  const { data, error } = await supabase.storage
    .from(bucketName) // "audio" or "cover" — was hardcoded to "your-bucket-name" 
    // .upload will take the file name and the file buffer and then we will use the contentType to set the content type of the file and then we will use the upsert to false to avoid overwriting the existing file with the same name.
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  // if upload fails, this will run
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  // If successful, return the path to the uploaded file
  return data.path; // this is your "key" to store in coverKey/audioKey
}

module.exports = { supabase, uploadToSupabase };