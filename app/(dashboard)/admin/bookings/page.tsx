import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import AdminBookingsTable from '@/components/admin/AdminBookingsTable'

export default async function AdminBookingsPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles!client_id(full_name, email)')
    .order('starts_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          All <span style={{ color: '#C9A84C' }}>Bookings</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">{(bookings ?? []).length} bookings total</p>
      </div>

      <AdminBookingsTable bookings={bookings ?? []} />
    </div>
  )
}
