'use client'

import { useState } from 'react'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { getAvailableTenuresForRole } from '@/lib/role-tenure-mapping'
import { ServerFileUpload } from '@/lib/server-file-upload'
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { generateOfferLetter } from '@/lib/docx-generator'

interface ApplicationFormProps {
  roles: Role[]
  tenures: Tenure[]
  onClose?: () => void
  inline?: boolean
}

interface FormData {
  first_name: string
  last_name: string
  father_name: string
  college_name: string
  address: string
  email: string
  phone: string
  role_id: string
  tenure_id: string
  // File uploads
  aadhar_front: File | null
  aadhar_back: File | null
  photo: File | null
  college_id: File | null
  marksheet_12th: File | null
}

export default function ApplicationForm({ roles, tenures, onClose, inline }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    father_name: '',
    college_name: '',
    address: '',
    email: '',
    phone: '',
    role_id: '',
    tenure_id: '',
    // File uploads
    aadhar_front: null,
    aadhar_back: null,
    photo: null,
    college_id: null,
    marksheet_12th: null
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [availableTenures, setAvailableTenures] = useState<Tenure[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update available tenures when role changes
    if (name === 'role_id') {
      const selectedRole = roles.find(role => role.id === value)
      if (selectedRole) {
        const availableMonths = getAvailableTenuresForRole(selectedRole.code)
        const filteredTenures = tenures.filter(tenure => availableMonths.includes(tenure.months))
        setAvailableTenures(filteredTenures)

        // Reset tenure selection
        setFormData(prev => ({
          ...prev,
          tenure_id: ''
        }))
      } else {
        setAvailableTenures([])
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]

      // Validate file
      const validation = ServerFileUpload.validateFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
      setError('') // Clear any previous errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Mandatory field validation
      const requiredText = [
        'first_name', 'last_name', 'father_name', 'college_name', 'address', 'email', 'phone'
      ] as const
      for (const key of requiredText) {
        // @ts-ignore
        if (!formData[key] || String(formData[key]).trim() === '') {
          throw new Error('Please fill in all required fields before submitting.')
        }
      }

      if (!formData.role_id || !formData.tenure_id) {
        throw new Error('Please select both Position and Duration.')
      }

      // Basic format checks
      const emailOk = /.+@.+\..+/.test(formData.email)
      if (!emailOk) throw new Error('Please enter a valid email address.')
      const phoneOk = /[0-9]{7,}/.test(formData.phone.replace(/\D/g, ''))
      if (!phoneOk) throw new Error('Please enter a valid phone number.')

      // File checks (all required)
      if (!formData.aadhar_front || !formData.aadhar_back || !formData.photo || !formData.college_id || !formData.marksheet_12th) {
        throw new Error('Please upload all required documents.')
      }

      // Generate temporary user ID for file uploads
      const tempUserId = `temp_${Date.now()}`

      // Upload files to Supabase Storage
      const fileUploads = [
        { file: formData.aadhar_front, folder: 'aadhar_front', key: 'aadhar_front_url' },
        { file: formData.aadhar_back, folder: 'aadhar_back', key: 'aadhar_back_url' },
        { file: formData.photo, folder: 'photos', key: 'photo_url' },
        { file: formData.college_id, folder: 'college_ids', key: 'college_id_url' },
        { file: formData.marksheet_12th, folder: 'marksheets', key: 'marksheet_12th_url' },
      ]

      const fileUrls: { [key: string]: string | null } = {}

      // Upload each file
      for (const upload of fileUploads) {
        if (upload.file) {
          setUploadProgress(prev => ({ ...prev, [upload.key]: true }))

          const result = await ServerFileUpload.uploadFile(
            upload.file,
            upload.folder,
            tempUserId
          )

          if (result.error) {
            throw new Error(`Failed to upload ${upload.folder}: ${result.error}`)
          }

          fileUrls[upload.key] = result.url
          setUploadProgress(prev => ({ ...prev, [upload.key]: false }))
        } else {
          fileUrls[upload.key] = null
        }
      }

      // Prepare data for database
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        father_name: formData.father_name,
        college_name: formData.college_name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
        tenure_id: formData.tenure_id,
        status: 'pending',
        ...fileUrls
      }

      // Insert into database
      const { data: newUsers, error: insertError } = await supabase
        .from('users')
        .insert([submitData])
        .select()

      if (insertError) {
        throw insertError
      }

      if (!newUsers || newUsers.length === 0) {
        throw new Error('Application submitted but failed to retrieve reference ID')
      }

      const newUser = newUsers[0]

      // Generate Offer Letter immediately using selected Role & Tenure
      const selectedRole = roles.find(r => r.id === formData.role_id)
      const selectedTenure = tenures.find(t => t.id === formData.tenure_id)
      if (!selectedRole || !selectedTenure) {
        throw new Error('Unable to generate offer letter: role or tenure not found')
      }

      await generateOfferLetter({
        candidateName: `${formData.first_name} ${formData.last_name}`.trim(),
        roleCode: selectedRole.code,
        tenureMonths: selectedTenure.months,
        roleName: selectedRole.name,
        tenureLabel: selectedTenure.label,
        userId: newUser.id
      })

      // Trigger Google Drive Sync (Background)
      fetch('/api/sync-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUser.id })
      }).catch(err => console.error('Drive sync failed:', err))

      setSuccess(true)
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your application')
    } finally {
      setLoading(false)
      setUploadProgress({})
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (inline) return
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div className={inline ? "w-full" : "modal-overlay"} onClick={handleOverlayClick}>
      <div className={inline ? "w-full max-w-3xl mx-auto p-4 md:p-8" : "glass-card w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-8 relative rounded-2xl"}>

        {/* Close Button */}
        {!inline && (
          <button
            onClick={onClose}
            className="absolute top-4 md:top-6 right-4 md:right-6 text-slate-400 hover:text-[#93cfe2] transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Join Zyntiq</h2>
          <p className="text-slate-400">Submit your application</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-400">Application submitted successfully! Our HR team will contact you shortly.</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-medium mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-slate-200 font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Parent Name */}
          <div>
            <label className="block text-slate-200 font-medium mb-2">{"Father's Name"}</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Father's name"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="professional@email.com"
              />
            </div>
            <div>
              <label className="block text-slate-200 font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Contact number"
              />
            </div>
          </div>

          {/* College / University */}
          <div>
            <label className="block text-slate-200 font-medium mb-2">College / University</label>
            <input
              type="text"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Enter college or university name"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-slate-200 font-medium mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="input-field w-full"
              placeholder="Enter full address"
            />
          </div>

          {/* Position and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-medium mb-2">Position</label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="">Select Position</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-200 font-medium mb-2">Duration</label>
              <select
                name="tenure_id"
                value={formData.tenure_id}
                onChange={handleChange}
                required
                disabled={!formData.role_id}
                className="input-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.role_id ? 'Select Role First' : 'Select Duration'}
                </option>
                {availableTenures.map((tenure) => (
                  <option key={tenure.id} value={tenure.id}>
                    {tenure.label}
                  </option>
                ))}
              </select>
              {formData.role_id && availableTenures.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">No tenures available for selected role</p>
              )}
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
              Required Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Aadhar Card (Front) <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="aadhar_front"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#93cfe2] file:text-slate-900 hover:file:bg-[#7ec5db] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Upload a clear image (JPG/PNG)</p>
              </div>

              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Aadhar Card (Back) <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="aadhar_back"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#93cfe2] file:text-slate-900 hover:file:bg-[#7ec5db] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Upload a clear image (JPG/PNG)</p>
              </div>

              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Candidate Photo <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#93cfe2] file:text-slate-900 hover:file:bg-[#7ec5db] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Passport size photo (JPG/PNG)</p>
              </div>

              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  College ID Card <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="college_id"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#93cfe2] file:text-slate-900 hover:file:bg-[#7ec5db] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Student ID card image (JPG/PNG)</p>
              </div>

              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  12th Marksheet <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="marksheet_12th"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#93cfe2] file:text-slate-900 hover:file:bg-[#7ec5db] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Class 12 certificate image (JPG/PNG)</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Submitted Successfully</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Get Offer Letter</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
