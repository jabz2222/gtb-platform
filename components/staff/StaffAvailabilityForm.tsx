'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface AvailabilitySlot {
  id: string
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  specific_date: string | null
  specific_start: string | null
  specific_end: string | null
  buffer_mins: number
  max_clients: number
}

interface StaffAvailabilityFormProps {
  staffId: string
  initialWeeklySlots: AvailabilitySlot[]
  initialSpecificSlots: AvailabilitySlot[]
}

export default function StaffAvailabilityForm({
  staffId,
  initialWeeklySlots,
  initialSpecificSlots,
}: StaffAvailabilityFormProps) {
  const [weeklySlots, setWeeklySlots] = useState<AvailabilitySlot[]>(initialWeeklySlots)
  const [specificSlots, setSpecificSlots] = useState<AvailabilitySlot[]>(initialSpecificSlots)
  const [showForm, setShowForm] = useState(false)
  const [slotType, setSlotType] = useState<'weekly' | 'specific'>('weekly')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '10:00',
    specific_date: '',
    specific_start: '09:00',
    specific_end: '10:00',
    buffer_mins: 15,
    max_clients: 1,
  })

  const supabase = createClient()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = slotType === 'weekly'
      ? {
          staff_id: staffId,
          day_of_week: form.day_of_week,
          start_time: form.start_time,
          end_time: form.end_time,
          buffer_mins: form.buffer_mins,
          max_clients: form.max_clients,
          is_active: true,
        }
      : {
          staff_id: staffId,
          specific_date: form.specific_date,
          specific_start: form.specific_start,
          specific_end: form.specific_end,
          buffer_mins: form.buffer_mins,
          max_clients: form.max_clients,
          is_active: true,
        }

    const { data, error } = await supabase
      .from('staff_availability')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      if (slotType === 'weekly') {
        setWeeklySlots(prev => [...prev, data])
      } else {
        setSpecificSlots(prev => [...prev, data])
      }
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleRemove(id: string) {
    await supabase.from('staff_availability').update({ is_active: false }).eq('id', id)
    setWeeklySlots(prev => prev.filter(s => s.id !== id))
    setSpecificSlots(prev => prev.filter(s => s.id !== id))
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-[11px] text-[#555] uppercase tracking-wider mb-1.5'

  return (
    <div>
      {/* Add Slot button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black
                     px-5 py-2.5 rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Slot
        </button>
      </div>

      {/* Add slot form */}
      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#C9A84C]/30 rounded-sm p-5 mb-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">New Availability Slot</p>

          {/* Slot type toggle */}
          <div className="flex gap-1 mb-5">
            {(['weekly', 'specific'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSlotType(t)}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-colors ${
                  slotType === t
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'bg-[#111] border border-white/5 text-[#555] hover:text-white'
                }`}
                style={slotType === t ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
              >
                {t === 'weekly' ? 'Weekly Recurring' : 'One-off Date'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {slotType === 'weekly' ? (
                <>
                  <div>
                    <label className={labelClass}>Day of Week</label>
                    <select
                      value={form.day_of_week}
                      onChange={e => setForm(p => ({ ...p, day_of_week: Number(e.target.value) }))}
                      className={`${inputClass} bg-[#141414]`}
                    >
                      {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                      className={inputClass}
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                      className={inputClass}
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      value={form.specific_date}
                      onChange={e => setForm(p => ({ ...p, specific_date: e.target.value }))}
                      className={inputClass}
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input
                      type="time"
                      value={form.specific_start}
                      onChange={e => setForm(p => ({ ...p, specific_start: e.target.value }))}
                      className={inputClass}
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input
                      type="time"
                      value={form.specific_end}
                      onChange={e => setForm(p => ({ ...p, specific_end: e.target.value }))}
                      className={inputClass}
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className={labelClass}>Buffer (mins)</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={form.buffer_mins}
                  onChange={e => setForm(p => ({ ...p, buffer_mins: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Clients</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.max_clients}
                  onChange={e => setForm(p => ({ ...p, max_clients: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                           px-5 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                {loading ? 'Adding…' : 'Add Slot'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-white/10 text-[#555] hover:text-white px-5 py-2
                           text-xs tracking-wider uppercase rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Weekly recurring */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Weekly Recurring Slots</span>
        </div>
        {weeklySlots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#333] text-sm">No recurring slots set</p>
            <p className="text-[11px] text-[#222] mt-1">Add your weekly availability so clients can book you</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {weeklySlots.map(slot => (
              <div key={slot.id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="text-sm font-medium text-white w-24 flex-shrink-0">
                  {DAYS[slot.day_of_week ?? 0]}
                </span>
                <span className="text-sm text-[#C9A84C]">
                  {slot.start_time} – {slot.end_time}
                </span>
                <span className="text-xs text-[#444]">
                  Max {slot.max_clients} · {slot.buffer_mins}min buffer
                </span>
                <button
                  onClick={() => handleRemove(slot.id)}
                  className="ml-auto text-xs text-[#333] hover:text-[#CC2222] transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* One-off specific slots */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">One-off Slots</span>
        </div>
        {specificSlots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#333] text-sm">No one-off slots set</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {specificSlots.map(slot => (
              <div key={slot.id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="text-sm text-white flex-shrink-0">
                  {slot.specific_date ? new Date(slot.specific_date).toLocaleDateString('en-GB') : '—'}
                </span>
                <span className="text-sm text-[#5BB8E8]">
                  {slot.specific_start
                    ? new Date(`1970-01-01T${slot.specific_start}`).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                  {' – '}
                  {slot.specific_end
                    ? new Date(`1970-01-01T${slot.specific_end}`).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
                <button
                  onClick={() => handleRemove(slot.id)}
                  className="ml-auto text-xs text-[#333] hover:text-[#CC2222] transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
