import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ModuleSubmissionForm from '@/components/education/ModuleSubmissionForm'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const [moduleRes, submissionRes] = await Promise.all([
    supabase
      .from('education_programme_modules')
      .select('*, education_programmes(id, title, slug)')
      .eq('id', moduleId)
      .single(),

    supabase
      .from('module_submissions')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!moduleRes.data) notFound()

  const mod = moduleRes.data
  const submission = submissionRes.data
  const programme = mod.education_programmes as { id: string; title: string; slug: string } | null

  const reflectionPrompts: string[] = mod.reflection_prompts
    ? mod.reflection_prompts.split('\n').filter(Boolean)
    : []

  const statusColors: Record<string, string> = {
    draft:     '#555',
    submitted: '#5BB8E8',
    approved:  '#2E8B35',
    rejected:  '#CC2222',
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#444] mb-6">
        <Link href="/education/programmes" className="hover:text-white transition-colors">Programmes</Link>
        {programme && (
          <>
            <span>/</span>
            <Link href={`/education/programmes/${programme.id}`} className="hover:text-white transition-colors">
              {programme.title}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#666]">Module {mod.module_order}</span>
      </div>

      {/* Module header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[#CC2222] text-[10px] tracking-[0.3em] uppercase">
            {mod.phase_title ?? `Phase ${mod.phase}`} · Module {mod.module_order}
          </span>
          {submission?.status && (
            <span
              className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-sm"
              style={{
                color: statusColors[submission.status],
                backgroundColor: statusColors[submission.status] + '20',
              }}
            >
              {submission.status}
            </span>
          )}
        </div>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {mod.title}
        </h1>
        {mod.description && (
          <p className="text-[#555] mt-2 text-sm leading-relaxed">{mod.description}</p>
        )}
      </div>

      {/* Module content */}
      {mod.content_body && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6 mb-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">Module Content</p>
          <div className="prose prose-invert prose-sm max-w-none text-[#888] leading-relaxed whitespace-pre-wrap">
            {mod.content_body}
          </div>
        </div>
      )}

      {/* Reflection prompts */}
      {reflectionPrompts.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6 mb-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">Reflection Prompts</p>
          <ul className="space-y-3">
            {reflectionPrompts.map((prompt, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#C9A84C] text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-[#666] text-sm leading-relaxed">{prompt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {Array.isArray(mod.resources) && mod.resources.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6 mb-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">Resources</p>
          <ul className="space-y-2">
            {(mod.resources as { title: string; url: string; type?: string }[]).map((res, i) => (
              <li key={i}>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#5BB8E8] hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  {res.title}
                  {res.type && <span className="text-[#333] text-[10px] uppercase">{res.type}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submission section */}
      {mod.requires_submission && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-1">Your Submission</p>
          <p className="text-[#444] text-xs mb-5">
            Write your response to this module. You may also upload supporting evidence. Once submitted, a GTB director will review and approve.
          </p>

          {submission?.status === 'approved' && (
            <div className="mb-5 p-4 bg-[#2E8B35]/10 border border-[#2E8B35]/20 rounded-sm">
              <p className="text-[#2E8B35] text-sm font-medium">Submission Approved ✓</p>
              {submission.feedback && (
                <p className="text-[#555] text-xs mt-1 leading-relaxed">{submission.feedback}</p>
              )}
            </div>
          )}

          {submission?.status === 'rejected' && submission.feedback && (
            <div className="mb-5 p-4 bg-[#CC2222]/10 border border-[#CC2222]/20 rounded-sm">
              <p className="text-[#CC2222] text-sm font-medium">Feedback from Director</p>
              <p className="text-[#888] text-xs mt-1 leading-relaxed">{submission.feedback}</p>
            </div>
          )}

          <ModuleSubmissionForm
            moduleId={moduleId}
            userId={user.id}
            existingText={submission?.text_response ?? ''}
            existingFileUrl={submission?.file_url ?? null}
            existingFileName={submission?.file_name ?? null}
            status={submission?.status ?? 'draft'}
          />
        </div>
      )}

      {!mod.requires_submission && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6 text-center">
          <p className="text-[#444] text-sm">This module does not require a submission.</p>
          {programme && (
            <Link
              href={`/education/programmes/${programme.id}`}
              className="mt-4 inline-block text-[#C9A84C] text-[11px] uppercase tracking-wider hover:text-white transition-colors"
            >
              ← Back to Programme
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
