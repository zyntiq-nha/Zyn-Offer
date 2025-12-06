import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appendRowToSheet } from '@/lib/google-drive'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' })
        }

        // 1. Fetch user data from Supabase
        // const supabaseAdmin = createAdminClient()
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*, role:roles(name), tenure:tenures(label)')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // 2. Prepare simplified row data for Google Sheet
        const sheetRow = [
            // Basic Info
            `${user.first_name} ${user.last_name}`, // Name
            user.email || '',                        // Email
            user.phone || '',                        // Phone
            user.college_name || '',                 // College / University
            user.address || '',                      // Address
            `${user.role?.name || ''} - ${user.tenure?.label || ''}`, // Role + Duration combined
            new Date(user.created_at).toLocaleString('en-IN'), // Applied Date

            // Document URLs from Supabase Storage
            user.photo_url || '',
            user.aadhar_front_url || '',
            user.aadhar_back_url || '',
            user.college_id_url || '',
            user.marksheet_12th_url || '',
        ]

        // 3. Append to Google Sheet
        console.log('Adding row to Google Sheet for user:', user.email)
        const sheetId = process.env.GOOGLE_SHEET_ID
        if (!sheetId) {
            throw new Error('GOOGLE_SHEET_ID not configured')
        }

        await appendRowToSheet(sheetId, sheetRow)
        console.log('Successfully added to Google Sheet')

        return res.status(200).json({
            success: true,
            message: 'Data synced to Google Sheet successfully',
            user: {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email
            }
        })

    } catch (error: any) {
        console.error('Error syncing to Google Sheet:', error)
        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'sync-error.log');
        const logMessage = `${new Date().toISOString()} - Error: ${error.message}\nStack: ${error.stack}\n\n`;
        try {
            fs.appendFileSync(logPath, logMessage);
        } catch (e) {
            console.error('Failed to write to log file', e);
        }

        return res.status(500).json({
            error: 'Failed to sync to Google Sheet',
            details: error.message
        })
    }
}
