import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TiltCard from '@/components/ui/motion/TiltCard'

export default async function EducationPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch content the user can access (RLS handles tier gating)
  const { data: content } = await supabase
    .from('education_content')
    .select(`
      id, title, description, content_type, duration_mins, is_free,
      division:divisions(name, color_hex)
    `)
    .not('published_at', 'is', null)
    .is('deleted_at', null)
    .order('order_index', { ascending: true })
    .limit(30)

  // Fetch user's progress
  const { data: progress } = await supabase
    .from('education_progress')
    .select('content_id, progress_pct, completed_at')
    .eq('user_id', user.id)

  const progressMap = new Map(progress?.map(p => [p.content_id, p]) ?? [])

  const videos = content?.filter(c => c.content_type === 'video') ?? []
  const documents = content?.filter(c => c.content_type === 'document') ?? []
  const live = content?.filter(c => c.content_type === 'live_session') ?? []

  const completed = progress?.filter(p => p.completed_at).length ?? 0
  const totalProgress = content && content.length > 0
    ? Math.round((completed / content.length) * 100) : 0

  const FOUR_D_WEEKS = [
    { week: 'W1', label: 'Delivery', sub: 'Technical', colour: '#2E8B35', description: 'Skill, technique, body mechanics, execution under pressure.' },
    { week: 'W2', label: 'Durability', sub: 'S&C', colour: '#E8641A', description: 'Physical development, athletic preparation, conditioning for footballers.' },
    { week: 'W3', label: 'Drive', sub: 'Mentoring', colour: '#C9A84C', description: 'Psychological & holistic development. Mindset, confidence, resilience, ownership.' },
    { week: 'W4', label: 'Decision', sub: 'Tactical', colour: '#5BB8E8', description: 'Game IQ, decision-making, reading the game, off-ball intelligence.' },
  ]

  const EDU_DIVISIONS = [
    { name: 'GTB Education Football', colour: '#CC2222', description: 'Football-specific technical, tactical, and holistic topics. 12-month curriculum aligned to the 4D Model and LTPD principles.' },
    { name: 'GTB Fitness S&C', colour: '#2E8B35', description: 'Strength & conditioning content planned to complement the weekly football topic. Physical development that supports what\'s coached on the pitch.' },
    { name: 'GTB Mentoring', colour: '#9B2454', description: 'The psychological angle for each week. Connects football topics to mindset, confidence, resilience, and player ownership.' },
  ]

  return (
    <div>
      <div className="mb-10">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">GTB Education</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Education <span style={{ color: '#CC2222' }}>Hub</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Learn Today. Lead Tomorrow. &mdash; &ldquo;I Own My Development.&rdquo;</p>
      </div>

      {/* 3 Education Divisions */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#555] mb-3">Three Integrated Divisions</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EDU_DIVISIONS.map(d => (
            <TiltCard key={d.name} maxTilt={5} shine>
              <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: d.colour }} />
                <p className="text-xs font-black tracking-wide uppercase mb-1.5" style={{ color: d.colour, fontFamily: "'Arial Black', sans-serif" }}>{d.name}</p>
                <p className="text-[11px] text-[#555] leading-relaxed">{d.description}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* 4D Weekly Structure */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#555] mb-3">The 4D Weekly Structure</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FOUR_D_WEEKS.map(w => (
            <TiltCard key={w.week} maxTilt={4} shine>
              <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: w.colour }} />
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black text-[#333] uppercase tracking-wider">{w.week}</span>
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: w.colour, fontFamily: "'Arial Black', sans-serif" }}>{w.label}</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-[#444] mb-1">{w.sub}</p>
                <p className="text-[11px] text-[#555] leading-relaxed">{w.description}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5">
          <div className="text-3xl font-black text-[#CC2222] mb-1" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalProgress}%
          </div>
          <div className="text-sm text-[#888]">Overall Progress</div>
          <div className="mt-2 w-full bg-[#2A2A2A] rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-[#CC2222]" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5">
          <div className="text-3xl font-black text-[#C9A84C] mb-1" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {completed}
          </div>
          <div className="text-sm text-[#888]">Completed</div>
        </div>
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5">
          <div className="text-3xl font-black text-[#5BB8E8] mb-1" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {content?.length ?? 0}
          </div>
          <div className="text-sm text-[#888]">Available Content</div>
        </div>
      </div>

      {/* Content sections */}
      {live.length > 0 && (
        <ContentSection title="Live Sessions" items={live} progressMap={progressMap} color="#9B2454" />
      )}
      {videos.length > 0 && (
        <ContentSection title="Videos" items={videos} progressMap={progressMap} color="#5BB8E8" />
      )}
      {documents.length > 0 && (
        <ContentSection title="Documents & Resources" items={documents} progressMap={progressMap} color="#2E8B35" />
      )}

      {(content?.length ?? 0) === 0 && (
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-12 text-center">
          <p className="text-[#555] text-sm">No education content available yet.</p>
          <p className="text-xs text-[#333] mt-1">Check back soon — content is being added.</p>
        </div>
      )}
    </div>
  )
}

type ContentItem = {
  id: string
  title: string
  description: string | null
  content_type: string
  duration_mins: number | null
  is_free: boolean
  // Supabase returns joins as arrays when untyped — normalised in component
  division: { name: string; color_hex: string }[] | { name: string; color_hex: string } | null
}

function ContentSection({
  title, items, progressMap, color
}: {
  title: string
  items: ContentItem[]
  progressMap: Map<string, { progress_pct: number; completed_at: string | null }>
  color: string
}) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color }}>
        {title} ({items.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const prog = progressMap.get(item.id)
          const pct = prog?.progress_pct ?? 0
          const done = !!prog?.completed_at
          return (
            <Link key={item.id} href={`/education/${item.content_type === 'video' ? 'videos' : item.content_type === 'document' ? 'documents' : 'live'}/${item.id}`}
                  className="bg-[#111] border border-[#1E1E1E] hover:border-[#C9A84C]/30 rounded-lg p-5
                             transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded capitalize"
                      style={{ color, backgroundColor: `${color}20` }}>
                  {item.content_type.replace('_', ' ')}
                </span>
                {item.is_free && (
                  <span className="text-xs text-[#2E8B35] bg-[#2E8B35]/10 px-2 py-0.5 rounded">Free</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-[#C9A84C] transition-colors mb-1">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-[#555] line-clamp-2 mb-3">{item.description}</p>
              )}
              <div className="flex items-center gap-2">
                {item.duration_mins && (
                  <span className="text-xs text-[#555]">{item.duration_mins}min</span>
                )}
                {(() => {
                  const div = Array.isArray(item.division) ? item.division[0] : item.division
                  return div ? (
                    <span className="text-xs" style={{ color: div.color_hex }}>{div.name}</span>
                  ) : null
                })()}
              </div>
              {pct > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-[#2A2A2A] rounded-full h-1">
                    <div className="h-1 rounded-full transition-all"
                         style={{ width: `${pct}%`, backgroundColor: done ? '#2E8B35' : '#C9A84C' }} />
                  </div>
                  <span className="text-xs text-[#555] mt-1 block">
                    {done ? '✓ Completed' : `${pct}% watched`}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
