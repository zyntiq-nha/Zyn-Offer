# Storage Bucket Setup Instructions

## Problem
You're seeing this error when submitting the application form:
```
Failed to upload aadhar_front: mime type application/json is not supported
```

This happens because the Supabase storage bucket doesn't exist or doesn't have the correct Row Level Security (RLS) policies.

## Solution

Follow these steps **in order**:

### Step 1: Create the Storage Bucket (Manual)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** (in the left sidebar)
3. Click **"Create a new bucket"** or **"New Bucket"**
4. Configure the bucket:
   - **Name**: `applications` (must be exactly this)
   - **Public bucket**: ✅ **Enable this** (toggle ON)
   - **File size limit**: `5242880` (5MB in bytes)
   - **Allowed MIME types**: Leave empty or add:
     ```
     image/jpeg,image/jpg,image/png,image/webp
     ```
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies (SQL)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire content from `scripts/setup-storage-policies.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (play button)
6. You should see a table showing 4 policies were created

### Step 3: Verify Setup

1. Go back to **Storage** → **Policies**
2. You should see these policies for the `applications` bucket:
   - ✅ Allow public uploads
   - ✅ Allow public reads
   - ✅ Allow public updates
   - ✅ Allow public deletes

### Step 4: Test the Application

1. Refresh your browser at `http://localhost:3000/apply`
2. Fill out the application form
3. Upload all required documents
4. Submit the form
5. It should now work without errors! ✅

## Troubleshooting

### "Bucket already exists" error
- The bucket exists but policies might be missing
- Skip Step 1 and go directly to Step 2

### "Permission denied" errors
- Make sure the bucket is set to **Public**
- Verify all 4 policies were created successfully
- Check that bucket name is exactly `applications`

### Still getting mime type errors
- Clear your browser cache and refresh
- Check browser console for detailed error messages
- Verify the SQL script ran successfully without errors

## Why This Happens

Supabase Storage uses Row Level Security (RLS) policies to control access to files. By default, all access is denied unless explicitly allowed by a policy. The application needs:

1. **INSERT** permission - to upload new files
2. **SELECT** permission - to read/download files
3. **UPDATE** permission - to modify files (optional)
4. **DELETE** permission - to remove files (optional)

The SQL script creates these policies to allow public access to the `applications` bucket.
