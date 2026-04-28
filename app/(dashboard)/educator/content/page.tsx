import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import EducatorContentManager from '@/components/educator/EducatorContentManager'

export default async function EducatorContentPage() {
  const { user } = await requireRole(['admin', 'educator'])
  const supabase = await createClient()

  const { data: content } = await supabase
    .from('education_content')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: tiers } = await supabase
    .from('tiers')
    .select('id, name')
    .order('id')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">Educator</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Content <span style={{ color: '#CC2222' }}>Library</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">{(content ?? []).length} modules total</p>
      </div>

      <EducatorContentManager
        content={content ?? []}
        tiers={tiers ?? []}
        educatorId={user.id}
      />
    </div>
  )
}
