import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a hybrid client that works around RLS issues
export const supabaseHybrid = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
})

// Helper function to fetch data with direct API calls as fallback
export async function hybridFetch(table: string, select: string = '*') {
  try {
    // Try Supabase client first
    const { data, error } = await supabaseHybrid
      .from(table)
      .select(select)
    
    if (data && data.length > 0) {
      return { data, error: null }
    }
    
    // If no data, try direct fetch
    console.log(`🔄 Trying direct fetch for ${table}...`)
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${select}`, {
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${supabaseAnonKey || ''}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const directData = await response.json()
      console.log(`✅ Direct fetch success for ${table}:`, directData.length)
      return { data: directData, error: null }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
  } catch (error: any) {
    console.error(`❌ Hybrid fetch failed for ${table}:`, error.message)
    return { data: [], error }
  }
}
