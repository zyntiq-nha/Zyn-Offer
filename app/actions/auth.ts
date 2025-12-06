'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import bcrypt from 'bcryptjs'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    try {
        // 1. Fetch admin by email using the secure admin client
        const { data: admin, error: fetchError } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', email)
            .single()

        if (fetchError || !admin) {
            return { error: 'Invalid credentials' }
        }

        // 2. Verify password securely on the server
        const match = await bcrypt.compare(password, admin.password_hash)
        if (!match) {
            return { error: 'Invalid credentials' }
        }

        // 3. Return success (client will handle redirection/session)
        // Note: Ideally, you should set a secure HTTP-only cookie here for session management.
        // For now, we'll return the admin info to let the client set the existing localStorage token
        // to maintain backward compatibility with the rest of the app, but this should be improved later.
        return {
            success: true,
            admin: {
                id: admin.id,
                email: admin.email
            }
        }

    } catch (error) {
        console.error('Login error:', error)
        return { error: 'An unexpected error occurred' }
    }
}
