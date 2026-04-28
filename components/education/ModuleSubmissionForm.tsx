'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  moduleId: string
  userId: string
  existingText: string
  existingFileUrl: string | null
  existingFileName: string | null
  status: string
}

export default function ModuleSubmissionForm({
  moduleId,
  userId,
  existingText,
  existingFileUrl,
  existingFileName,
  status,
}: Props) {
  const [text, setText] = useState(existingText)
  const [fileUrl, setFileUrl] = useState(existingFileUrl)
  const [fileName, setFileName] = useState(existingFileName)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const isReadOnly = status === 'approved' || status === 'submitted'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const path = `module-submissions/${userId}/${moduleId}/${file.name}`
      const { error } = await supabase.storage
        .from('education')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('education').getPublicUrl(path)
      setFileUrl(publicUrl)
      setFileName(file.name)
    } catch {
      setMessage({ type: 'error', text: 'File upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(submitForReview: boolean) {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('module_submissions')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          text_response: text,
          file_url: fileUrl,
          file_name: fileName,
          status: submitForReview ? 'submitted' : 'draft',
          submitted_at: submitForReview ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,module_id' })

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
      } else {
        setMessage({
          type: 'success',
          text: submitForReview
            ? 'Submitted for review! A director will review your response.'
            : 'Draft saved.',
        })
        if (submitForReview) {
          // Refresh after short delay to reflect new status
          setTimeout(() => window.location.reload(), 1500)
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className="p-3 rounded-sm text-sm"
          style={{
            backgroundColor: message.type === 'success' ? '#2E8B35' + '15' : '#CC2222' + '15',
            color: message.type === 'success' ? '#2E8B35' : '#CC2222',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Text response */}
      <div>
        <label className="block text-[11px] text-[#444] uppercase tracking-wider mb-2">
          Written Response
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isReadOnly}
          rows={8}
          placeholder="Write your reflection, response, or analysis here..."
          className="w-full bg-[#111] border border-white/10 rounded-sm px-4 py-3 text-sm text-white
                     placeholder-[#333] resize-y focus:outline-none focus:border-[#C9A84C]/50
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* File upload */}
      {!isReadOnly && (
        <div>
          <label className="block text-[11px] text-[#444] uppercase tracking-wider mb-2">
            Supporting Evidence <span className="text-[#333] normal-case tracking-normal">(optional)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="px-4 py-2 border border-white/10 rounded-sm text-[11px] text-[#555]
                            group-hover:border-white/20 group-hover:text-white transition-colors">
              {uploading ? 'Uploading...' : fileName ? 'Replace file' : 'Choose file'}
            </div>
            {fileName && <span className="text-[11px] text-[#555] truncate max-w-[200px]">{fileName}</span>}
            <input
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.mp4,.mov,.png,.jpg,.jpeg"
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Existing file link */}
      {fileUrl && (
        <div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5BB8E8] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View uploaded file
          </a>
        </div>
      )}

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isPending || uploading}
            className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-white/10
                       text-[#555] hover:text-white hover:border-white/20 rounded-sm
                       disabled:opacity-40 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isPending || uploading || !text.trim()}
            className="px-5 py-2 text-[11px] tracking-[0.2em] uppercase rounded-sm
                       bg-[#C9A84C] text-black font-medium
                       hover:bg-[#C9A84C]/80 disabled:opacity-40 transition-colors"
          >
            {isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}
    </div>
  )
}
