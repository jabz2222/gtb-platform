import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils/formatters'

export default async function GroupClassesPage() {
  await requireAuth()
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('group_classes')
    .select(`
      id, title, description, is_public, max_participants, starts_at, ends_at,
      location, cost_p,
      instructor:profiles!group_classes_instructor_id_fkey(full_name),
      division:divisions(name, color_hex)
    `)
    .eq('is_public', true)
    .gte('starts_at', new Date().toISOString())
    .is('deleted_at', null)
    .order('starts_at')

  return (
    <div>
      <div className="mb-10">
        <p className="text-[#2E8B35] text-[11px] tracking-[0.3em] uppercase mb-2">Bookings</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Group <span style={{ color: '#2E8B35' }}>Classes</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Public sessions open to all GTB members</p>
      </div>

      {(classes?.length ?? 0) === 0 ? (
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-12 text-center">
          <p className="text-[#555] text-sm">No upcoming group classes</p>
          <p className="text-xs text-[#333] mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes?.map((cls: Record<string, unknown>) => {
            const rawDivision = cls.division as { name: string; color_hex: string }[] | { name: string; color_hex: string } | null
            const division = Array.isArray(rawDivision) ? rawDivision[0] ?? null : rawDivision
            const rawInstructor = cls.instructor as { full_name: string | null }[] | { full_name: string | null } | null
            const instructor = Array.isArray(rawInstructor) ? rawInstructor[0] ?? null : rawInstructor
            return (
              <div key={cls.id as string}
                   className="bg-[#111] border border-[#1E1E1E] rounded-lg overflow-hidden hover:border-[#2E8B35]/30 transition-colors">
                {division && (
                  <div className="h-1 w-full" style={{ backgroundColor: division.color_hex }} />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">{cls.title as string}</h3>
                    {division && (
                      <span className="text-xs px-2 py-0.5 rounded flex-shrink-0 ml-2"
                            style={{ color: division.color_hex, backgroundColor: `${division.color_hex}20` }}>
                        {division.name}
                      </span>
                    )}
                  </div>
                  {cls.description ? (
                    <p className="text-xs text-[#555] mb-3 line-clamp-2">{String(cls.description)}</p>
                  ) : null}
                  <div className="space-y-1 text-xs text-[#555] mb-4">
                    <p>{formatDateTime(String(cls.starts_at))}</p>
                    {instructor?.full_name ? <p className="text-[#444]">{instructor.full_name}</p> : null}
                    {cls.location ? <p className="text-[#444]">{String(cls.location)}</p> : null}
                    <p className="text-[#444]">Max {cls.max_participants as number} participants</p>
                  </div>
                  <Link href={`/bookings/classes/${cls.id}`}
                        className="block w-full text-center bg-[#2E8B35] hover:bg-[#277a2e] text-white
                                   font-bold py-2 rounded text-sm tracking-wider uppercase transition-colors">
                    {(cls.cost_p as number) === 0 ? 'Join Free' : `Book — £${((cls.cost_p as number) / 100).toFixed(2)}`}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
