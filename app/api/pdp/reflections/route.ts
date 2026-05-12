import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SessionEntry {
  area: string
  rating?: number | null
  note?: string | null
}

interface SessionBody {
  kind: 'session'
  reflection_type: 'training' | 'match'
  session_date: string // YYYY-MM-DD
  entries: SessionEntry[]
}

interface SCBody {
  kind: 'sc'
  session_date: string
  session_type: string
  duration_mins: number | null
  focus: string | null
  completed: boolean
  reflection: string | null
}

interface WeeklyRow {
  area: string | null
  target: string
  actions?: string | null
  evidence?: string | null
  challenges?: string | null
  learnings?: string | null
  next_step?: string | null
  status_colour?: string | null
}

interface WeeklyBody {
  kind: 'weekly'
  week_start: string
  // Single reflection (legacy)
  area?: string | null
  target?: string
  actions?: string | null
  evidence?: string | null
  challenges?: string | null
  learnings?: string | null
  next_step?: string | null
  status_colour?: string | null
  // Batch insert (new — used by 5-pillar weekly reflection table)
  rows?: WeeklyRow[]
}

type Body = SessionBody | SCBody | WeeklyBody

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: Body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.kind === 'session') {
    if (body.reflection_type !== 'training' && body.reflection_type !== 'match') {
      return NextResponse.json({ error: 'reflection_type must be training or match' }, { status: 400 })
    }
    if (!Array.isArray(body.entries) || body.entries.length === 0) {
      return NextResponse.json({ error: 'entries required' }, { status: 400 })
    }
    const rows = body.entries.map(e => ({
      player_id: user.id,
      session_date: body.session_date,
      reflection_type: body.reflection_type,
      area: e.area,
      rating: e.rating ?? null,
      notes: e.note ?? null,
    }))
    const { error } = await supabase.from('pdp_session_reflections').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, inserted: rows.length }, { status: 201 })
  }

  if (body.kind === 'sc') {
    const { error } = await supabase.from('pdp_sc_sessions').insert({
      player_id: user.id,
      session_date: body.session_date,
      session_type: body.session_type,
      duration_mins: body.duration_mins,
      focus: body.focus,
      completed: body.completed,
      reflection: body.reflection,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  if (body.kind === 'weekly') {
    // Batch path: 5-pillar weekly reflection table from the player portal
    if (Array.isArray(body.rows) && body.rows.length > 0) {
      const filtered = body.rows.filter(r => r.target?.trim())
      if (filtered.length === 0) {
        return NextResponse.json({ error: 'At least one row needs a target' }, { status: 400 })
      }
      const rows = filtered.map(r => ({
        player_id: user.id,
        week_start: body.week_start,
        area: r.area ?? null,
        target: r.target,
        actions: r.actions ?? null,
        evidence: r.evidence ?? null,
        challenges: r.challenges ?? null,
        learnings: r.learnings ?? null,
        next_step: r.next_step ?? null,
        status_colour: r.status_colour ?? null,
      }))
      const { error } = await supabase.from('pdp_reflections').insert(rows)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, inserted: rows.length }, { status: 201 })
    }

    // Single-row path (legacy)
    if (!body.target?.trim()) {
      return NextResponse.json({ error: 'target required' }, { status: 400 })
    }
    const { error } = await supabase.from('pdp_reflections').insert({
      player_id: user.id,
      week_start: body.week_start,
      area: body.area,
      target: body.target,
      actions: body.actions,
      evidence: body.evidence,
      challenges: body.challenges,
      learnings: body.learnings,
      next_step: body.next_step,
      status_colour: body.status_colour,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}
