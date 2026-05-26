import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Programme {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  total_phases: number
  total_modules: number
  estimated_hours: number | null
  is_active: boolean
}

interface Enrolment {
  programme_id: string
  completed_at: string | null
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="flex-shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#1A1A1A" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke="#C9A84C" strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fill="#C9A84C" fontSize="10" fontWeight="bold">
        {pct}%
      </text>
    </svg>
  )
}

export default async function ProgrammesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [programmesRes, enrolmentsRes] = await Promise.all([
    supabase
      .from('education_programmes')
      .select('id, slug, title, subtitle, description, total_phases, total_modules, estimated_hours, is_active')
      .eq('is_active', true)
      .order('created_at'),

    supabase
      .from('programme_enrolments')
      .select('programme_id, completed_at')
      .eq('user_id', user.id),
  ])

  const programmes = (programmesRes.data ?? []) as Programme[]
  const enrolments = (enrolmentsRes.data ?? []) as Enrolment[]

  // Count approved submissions per programme for progress
  const enrolmentMap = new Map(enrolments.map(e => [e.programme_id, e]))

  // Fetch submission counts per programme for enrolled user
  const { data: submissionsData } = await supabase
    .from('module_submissions')
    .select('module_id, status, education_programme_modules(programme_id)')
    .eq('user_id', user.id)
    .eq('status', 'approved')

  const approvedByProgramme = new Map<string, number>()
  for (const s of (submissionsData ?? [])) {
    const progId = (s.education_programme_modules as { programme_id: string } | null)?.programme_id
    if (progId) approvedByProgramme.set(progId, (approvedByProgramme.get(progId) ?? 0) + 1)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">GTB Education</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Education <span style={{ color: '#CC2222' }}>Programmes</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Structured learning pathways built on the 4D Model — Drive · Decision · Delivery · Durability
        </p>
      </div>

      <div className="space-y-4">
        {programmes.map(prog => {
          const enrolment = enrolmentMap.get(prog.id)
          const isEnrolled = !!enrolment
          const isComplete = !!enrolment?.completed_at
          const approved = approvedByProgramme.get(prog.id) ?? 0
          const pct = prog.total_modules > 0 ? Math.round((approved / prog.total_modules) * 100) : 0

          return (
            <div key={prog.id} className="bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm transition-colors">
              <div className="p-6 flex items-start gap-5">
                {isEnrolled && <ProgressRing pct={pct} />}
                {!isEnrolled && (
                  <div className="w-[52px] h-[52px] rounded-sm bg-[#CC2222]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#CC2222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      {prog.subtitle && (
                        <p className="text-[#CC2222] text-[10px] tracking-[0.25em] uppercase mb-1">{prog.subtitle}</p>
                      )}
                      <h2
                        className="text-lg font-black tracking-wide text-white uppercase"
                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                      >
                        {prog.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isComplete && (
                        <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-sm bg-[#2E8B35]/20 text-[#2E8B35]">
                          Completed
                        </span>
                      )}
                      {isEnrolled && !isComplete && (
                        <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-sm bg-[#C9A84C]/10 text-[#C9A84C]">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {prog.description && (
                    <p className="text-[#444] text-sm mt-2 leading-relaxed line-clamp-2">{prog.description}</p>
                  )}

                  <div className="flex items-center gap-5 mt-3">
                    <span className="text-[11px] text-[#555]">
                      <span className="text-white">{prog.total_phases}</span> phases
                    </span>
                    <span className="text-[11px] text-[#555]">
                      <span className="text-white">{prog.total_modules}</span> modules
                    </span>
                    {prog.estimated_hours && (
                      <span className="text-[11px] text-[#555]">
                        <span className="text-white">~{prog.estimated_hours}</span> hrs
                      </span>
                    )}
                    {isEnrolled && (
                      <span className="text-[11px] text-[#555]">
                        <span className="text-[#C9A84C]">{approved}</span>/{prog.total_modules} approved
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/education/programmes/${prog.id}`}
                  className="flex-shrink-0 px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium rounded-sm transition-colors"
                  style={{
                    backgroundColor: isEnrolled ? '#C9A84C' : '#CC2222',
                    color: isEnrolled ? '#000' : '#fff',
                  }}
                >
                  {isComplete ? 'Review' : isEnrolled ? 'Continue' : 'Enrol'}
                </Link>
              </div>
            </div>
          )
        })}

        {programmes.length === 0 && (
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
            <p className="text-[#444] text-sm">No programmes available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
