-- SECURE RLS SETUP
-- Run this in Supabase SQL Editor to lock down your database

-- 1. Enable RLS on admins table (if not already enabled)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. Drop the insecure policy that allowed public read access
DROP POLICY IF EXISTS "public select for login" ON admins;
DROP POLICY IF EXISTS "Allow admin full access to all tables" ON admins;

-- 3. Ensure no other policies allow anon access to admins
-- (You can manually check policies in the dashboard)

-- 4. Create a policy that allows ONLY the service role to access admins
-- Note: Service role bypasses RLS by default, so we just need to ensure NO public policies exist.
-- If you want to be explicit, you can create a policy that denies everything to anon, 
-- but simply having RLS enabled with no policies for anon achieves the same result (default deny).

-- 5. (Optional) If you have other tables that should be private, ensure RLS is enabled on them too.
-- For example, if you want to restrict templates/users to only be visible to logged-in admins,
-- you would need to implement Row Level Security policies that check for the admin's session.
-- Since we are currently using client-side tokens (localStorage), true RLS for other tables 
-- is harder to enforce without migrating to Supabase Auth or a custom middleware.
-- BUT, securing the `admins` table is the most critical step to prevent password hash leakage.
