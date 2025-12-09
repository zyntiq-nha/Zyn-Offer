import imageCompression from 'browser-image-compression'

// Server-side file upload helper with client-side compression
export class ServerFileUpload {
    // Aggressive compression settings for maximum free tier capacity
    private static COMPRESSION_OPTIONS = {
        maxSizeMB: 0.5, // Target 500KB max per image
        maxWidthOrHeight: 1600, // Reduce from 1920 to save more space
        useWebWorker: true,
        fileType: 'image/webp', // WebP gives best compression
        initialQuality: 0.7, // 70% quality - good balance
    }

    static async uploadFile(
        file: File,
        folder: string,
        userId: string
    ): Promise<{ url: string; path: string; error?: string }> {
        try {
            let fileToUpload = file

            // Compress image on client-side BEFORE uploading
            if (file.type.startsWith('image/')) {
                console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

                try {
                    const compressedFile = await imageCompression(file, this.COMPRESSION_OPTIONS)
                    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
                    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '% saved')

                    fileToUpload = compressedFile
                } catch (compressionError) {
                    console.warn('Client-side compression failed, using original:', compressionError)
                    // Continue with original file if compression fails
                }
            }

            // Convert file to base64
            const base64 = await this.fileToBase64(fileToUpload)

            // Send to server API
            const response = await fetch('/api/upload-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileData: base64,
                    fileName: fileToUpload.name,
                    contentType: fileToUpload.type,
                    folder,
                    userId
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const result = await response.json()
            return {
                url: result.url,
                path: result.path
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            return {
                url: '',
                path: '',
                error: error.message
            }
        }
    }

    private static fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    static validateFile(file: File): { valid: boolean; error?: string } {
        // Reduced from 10MB to 5MB to encourage compression
        const MAX_SIZE = 5 * 1024 * 1024 // 5MB
        const ALLOWED_TYPES = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/heic',
            'image/heif',
            'image/webp', // Added WebP support
            'application/pdf'
        ]

        if (file.size > MAX_SIZE) {
            return { valid: false, error: 'File size must be less than 5MB (images will be auto-compressed)' }
        }

        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|heic|heif|webp|pdf)$/i)) {
            return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, HEIC, WebP, PDF' }
        }

        return { valid: true }
    }
}
