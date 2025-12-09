# 🗄️ Database Setup Guide

## **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** and click "New Project"
3. **Choose organization** and create project
4. **Wait for setup** (takes 2-3 minutes)

## **Step 2: Get Your Credentials**

1. **Go to Project Settings** → **API**
2. **Copy these values**:
   - Project URL
   - anon/public key
   - service_role key (optional)

## **Step 3: Update Environment Variables**

Update your `.env.local` file with your actual Supabase credentials:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Credentials
ADMIN_EMAIL=admin@system.com
ADMIN_PASSWORD=admin123
```

## **Step 4: Create Database Schema**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Create new query**
3. **Copy and paste** the entire content from `supabase/schema.sql`
4. **Run the query** (click the play button)

## **Step 5: Initialize Default Data**

1. **In SQL Editor**, create another new query
2. **Copy and paste** the content from `scripts/init-database.sql`
3. **Run the query** to populate default data

## **Step 6: Verify Setup**

1. **Go to Table Editor** in Supabase
2. **Check these tables exist**:
   - ✅ admins (1 row)
   - ✅ roles (3 rows)
   - ✅ tenures (3 rows)
   - ✅ templates (7 rows)
   - ✅ users (empty initially)
   - ✅ offer_letters (empty initially)

## **Step 7: Test Your Application**

1. **Restart your Next.js server**: `npm run dev`
2. **Go to admin panel**: Login with admin@system.com / admin123
3. **Test all features**:
   - ✅ View roles and tenures
   - ✅ Add/delete templates
   - ✅ View user applications
   - ✅ Generate offer letters

## **🎯 Your Database is Now Live!**

- ✅ **Real persistence** - No more localStorage
- ✅ **All CRUD operations** work with database
- ✅ **Multi-user support** - Data shared across sessions
- ✅ **Production ready** - Scalable Supabase backend

## **🔧 Troubleshooting**

**Connection Issues:**
- Check your `.env.local` credentials
- Ensure Supabase project is active
- Verify network connectivity

**Schema Errors:**
- Run schema.sql in correct order
- Check for typos in table names
- Ensure RLS policies are created

**Data Issues:**
- Run init-database.sql after schema
- Check table permissions
- Verify foreign key relationships

**Need Help?**
- Check Supabase logs in dashboard
- Use browser dev tools for network errors
- Verify environment variables are loaded
