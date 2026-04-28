import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

interface EnquiryBody {
  full_name?: string
  email?: string
  phone?: string
  division_slug?: string
  session_type?: string
  participant_age?: string
  message?: string
  source?: string
  honeypot?: string
}

const VALID_DIVISIONS = ['football', 'fitness', 'sports', 'mentoring', 'education']

export async function POST(request: Request) {
  let body: EnquiryBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Honeypot — bots usually fill all fields. If honeypot present, silently 200.
  if (body.honeypot && body.honeypot.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const { full_name, email, division_slug, session_type } = body
  if (!full_name?.trim() || !email?.trim() || !division_slug || !session_type?.trim()) {
    return NextResponse.json(
      { error: 'full_name, email, division_slug, and session_type are required' },
      { status: 400 }
    )
  }
  if (!VALID_DIVISIONS.includes(division_slug)) {
    return NextResponse.json({ error: 'Invalid division' }, { status: 400 })
  }
  // Light email validation (Supabase will catch real signups — this is for the public form)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('booking_enquiries')
    .insert({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      division_slug,
      session_type: session_type.trim(),
      participant_age: body.participant_age?.trim() || null,
      message: body.message?.trim() || null,
      source: body.source?.trim() || null,
      status: 'new',
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data?.id })
}
