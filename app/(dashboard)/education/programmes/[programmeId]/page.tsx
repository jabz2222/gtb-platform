import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Module {
  id: string
  phase: number
  phase_title: string | null
  module_order: number
  title: string
  description: string | null
  requires_submission: boolean
  unlock_after_id: string | null
}

interface Submission {
  module_id: string
  status: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Draft',     color: '#555' },
  submitted: { label: 'Submitted', color: '#5BB8E8' },
  approved:  { label: 'Approved',  color: '#2E8B35' },
  rejected:  { label: 'Rejected',  color: '#CC2222' },
}

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ programmeId: string }>
}) {
  const { programmeId } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const [progRes, modulesRes, enrolmentRes, submissionsRes] = await Promise.all([
    supabase
      .from('education_programmes')
      .select('id, title, subtitle, description, total_phases, total_modules, estimated_hours')
      .eq('id', programmeId)
      .single(),

    supabase
      .from('education_programme_modules')
      .select('id, phase, phase_title, module_order, title, description, requires_submission, unlock_after_id')
      .eq('programme_id', programmeId)
      .order('module_order'),

    supabase
      .from('programme_enrolments')
      .select('enrolled_at, completed_at')
      .eq('programme_id', programmeId)
      .eq('user_id', user.id)
      .maybeSingle(),

    supabase
      .from('module_submissions')
      .select('module_id, status')
      .eq('user_id', user.id)
      .in('module_id',
        // We'll filter server-side after fetching modules
        ['00000000-0000-0000-0000-000000000000']
      ),
  ])

  if (!progRes.data) notFound()

  const programme = progRes.data
  const modules = (modulesRes.data ?? []) as Module[]
  const enrolment = enrolmentRes.data
  const isEnrolled = !!enrolment

  // Re-fetch submissions with correct module IDs
  const moduleIds = modules.map(m => m.id)
  const { data: submissionsData } = moduleIds.length > 0
    ? await supabase
        .from('module_submissions')
        .select('module_id, status')
        .eq('user_id', user.id)
        .in('module_id', moduleIds)
    : { data: [] }

  const submissions = (submissionsData ?? []) as Submission[]
  const submissionMap = new Map(submissions.map(s => [s.module_id, s.status]))

  // Build unlock set: a module is unlocked if its unlock_after_id has an approved submission
  // (or it has no unlock_after_id = first module)
  const approvedSet = new Set(submissions.filter(s => s.status === 'approved').map(s => s.module_id))

  function isUnlocked(mod: Module): boolean {
    if (!mod.unlock_after_id) return true          // first module
    return approvedSet.has(mod.unlock_after_id)     // previous is approved
  }

  // Group by phase
  const phases = Array.from(new Set(modules.map(m => m.phase))).sort()
  const modulesByPhase = new Map<number, Module[]>()
  for (const mod of modules) {
    const list = modulesByPhase.get(mod.phase) ?? []
    list.push(mod)
    modulesByPhase.set(mod.phase, list)
  }

  const approved = submissions.filter(s => s.status === 'approved').length
  const pct = modules.length > 0 ? Math.round((approved / modules.length) * 100) : 0

  return (
    <div>
      {/* Back */}
      <Link
        href="/education/programmes"
        className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors"
      >
        ← All Programmes
      </Link>

      {/* Header */}
      <div className="mb-8">
        {programme.subtitle && (
          <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">{programme.subtitle}</p>
        )}
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {programme.title}
        </h1>
        {programme.description && (
          <p className="text-[#444] mt-2 text-sm leading-relaxed max-w-2xl">{programme.description}</p>
        )}
      </div>

      {/* Stats + enrol */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#444]">Phases</p>
            <p className="text-xl font-black text-white mt-0.5" style={{ fontFamily: "'Arial Black', sans-serif" }}>
              {programme.total_phases}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#444]">Modules</p>
            <p className="text-xl font-black text-white mt-0.5" style={{ fontFamily: "'Arial Black', sans-serif" }}>
              {programme.total_modules}
            </p>
          </div>
          {programme.estimated_hours && (
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#444]">Est. Hours</p>
              <p className="text-xl font-black text-white mt-0.5" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                ~{programme.estimated_hours}
              </p>
            </div>
          )}
          {isEnrolled && (
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#444]">Progress</p>
              <p className="text-xl font-black text-[#C9A84C] mt-0.5" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                {pct}%
              </p>
            </div>
          )}
        </div>

        {!isEnrolled && (
          <form action={`/api/enrol`} method="POST">
            <input type="hidden" name="programmeId" value={programmeId} />
            <Link
              href={`/education/programmes/${programmeId}/enrol`}
              className="px-5 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#CC2222] text-white hover:bg-[#CC2222]/80 transition-colors"
            >
              Enrol in Programme
            </Link>
          </form>
        )}
        {isEnrolled && enrolment.completed_at && (
          <span className="text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-sm bg-[#2E8B35]/20 text-[#2E8B35]">
            Programme Complete
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isEnrolled && (
        <div className="mb-8">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-[#444] uppercase tracking-wider">Overall Progress</span>
            <span className="text-[11px] text-[#C9A84C]">{approved} / {modules.length} modules approved</span>
          </div>
          <div className="w-full bg-[#1A1A1A] rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#C9A84C] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Modules by phase */}
      <div className="space-y-6">
        {phases.map(phase => {
          const phaseMods = modulesByPhase.get(phase) ?? []
          const phaseTitle = phaseMods[0]?.phase_title ?? `Phase ${phase}`
          const phaseApproved = phaseMods.filter(m => submissionMap.get(m.id) === 'approved').length
          const phaseComplete = phaseApproved === phaseMods.length

          return (
            <div key={phase} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              {/* Phase header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#444]">Phase {phase}</span>
                  <p className="text-sm font-medium text-white mt-0.5">{phaseTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {phaseComplete && isEnrolled && (
                    <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-sm bg-[#2E8B35]/20 text-[#2E8B35]">
                      Complete
                    </span>
                  )}
                  <span className="text-[11px] text-[#444]">
                    {phaseApproved}/{phaseMods.length}
                  </span>
                </div>
              </div>

              {/* Module list */}
              <div className="divide-y divide-white/[0.04]">
                {phaseMods.map(mod => {
                  const unlocked = isEnrolled && isUnlocked(mod)
                  const status = submissionMap.get(mod.id)
                  const statusConfig = status ? STATUS_CONFIG[status] : null

                  return (
                    <div
                      key={mod.id}
                      className={`px-5 py-4 flex items-center gap-4 ${!unlocked ? 'opacity-40' : ''}`}
                    >
                      {/* Module number */}
                      <div
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: status === 'approved' ? '#2E8B35' + '20'
                            : status === 'submitted' ? '#5BB8E8' + '20'
                            : '#1A1A1A',
                          color: status === 'approved' ? '#2E8B35'
                            : status === 'submitted' ? '#5BB8E8'
                            : '#444',
                        }}
                      >
                        {status === 'approved' ? '✓' : mod.module_order}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{mod.title}</p>
                        {mod.description && (
                          <p className="text-[11px] text-[#444] mt-0.5 line-clamp-1">{mod.description}</p>
                        )}
                      </div>

                      {/* Status + action */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {statusConfig && (
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                          </span>
                        )}
                        {unlocked ? (
                          <Link
                            href={`/education/modules/${mod.id}`}
                            className="text-[11px] uppercase tracking-wider text-[#C9A84C] hover:text-white transition-colors"
                          >
                            {status === 'approved' ? 'Review →' : status ? 'Continue →' : 'Start →'}
                          </Link>
                        ) : (
                          <span className="text-[11px] text-[#333]">
                            {isEnrolled ? 'Locked' : 'Enrol to access'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
