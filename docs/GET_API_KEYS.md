# 🔑 Get Your Supabase API Keys

## **URGENT: You need to get your real API keys**

### Step 1: Go to Supabase Dashboard
**Open this link:** https://supabase.com/dashboard/project/ikrzojbhdkmkeyugls/settings/api

### Step 2: Copy Your Keys
You'll see two important keys:

1. **anon / public key** (starts with `eyJ...`)
2. **service_role key** (starts with `eyJ...`)

### Step 3: Update Your .env.local File
Replace the content of your `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ikrzojbhdkmkeyugls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# Admin Credentials
ADMIN_EMAIL=admin@system.com
ADMIN_PASSWORD=admin123
```

### Step 4: Restart Your Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test Connection
Go back to your admin panel and click "Test Direct Fetch" - it should work!

---

**The connection is failing because the API keys don't match your project. Once you update them with the real keys from your dashboard, everything will work perfectly!**
