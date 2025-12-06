import { google } from 'googleapis'

// Initialize Google Drive and Sheets clients
export function getDriveClient() {
    const credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    })

    const drive = google.drive({ version: 'v3', auth })
    const sheets = google.sheets({ version: 'v4', auth })

    return { drive, sheets, auth }
}

/**
 * Append a row to a Google Sheet
 * @param sheetId - The Google Sheet ID
 * @param values - Array of values to append as a new row
 */
export async function appendRowToSheet(sheetId: string, values: any[]) {
    try {
        const { sheets } = getDriveClient()

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A:Z', // Adjust range as needed
            valueInputOption: 'RAW',
            requestBody: {
                values: [values],
            },
        })

        console.log('Row appended to sheet:', response.data)
        return response.data
    } catch (error) {
        console.error('Error appending row to sheet:', error)
        throw error
    }
}
