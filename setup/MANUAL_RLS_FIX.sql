-- MANUAL RLS FIX
-- Copy and paste this SQL into your Supabase SQL Editor

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS "Allow admin full access to templates" ON templates;
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;
DROP POLICY IF EXISTS "Allow admin full access to offer_letters" ON offer_letters;
DROP POLICY IF EXISTS "Allow admin full access to all tables" ON admins;

-- Step 2: Disable RLS temporarily for admin operations
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant permissions to anon role (for admin panel access)
GRANT ALL ON templates TO anon;
GRANT ALL ON users TO anon;
GRANT ALL ON offer_letters TO anon;
GRANT ALL ON admins TO anon;
GRANT ALL ON roles TO anon;
GRANT ALL ON tenures TO anon;

-- Step 4: Create simple policies for production (optional)
-- Uncomment these if you want to re-enable RLS later with better policies

-- ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "templates_public_read" ON templates FOR SELECT USING (true);
-- CREATE POLICY "templates_public_write" ON templates FOR ALL USING (true);

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
-- CREATE POLICY "users_public_write" ON users FOR ALL USING (true);

-- ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "offer_letters_public_read" ON offer_letters FOR SELECT USING (true);
-- CREATE POLICY "offer_letters_public_write" ON offer_letters FOR ALL USING (true);

-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "admins_public_read" ON admins FOR SELECT USING (true);
-- CREATE POLICY "admins_public_write" ON admins FOR ALL USING (true);
