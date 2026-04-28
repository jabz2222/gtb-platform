import { requireAuth } from '@/lib/auth/requireRole'
import ContractedWizard from '@/components/booking/ContractedWizard'

export default async function ContractedPage() {
  const user = await requireAuth()

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Bookings</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Book <span style={{ color: '#C9A84C' }}>Contracted</span> Programme
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Contracted programmes are block-booked periods with dedicated coaching time
        </p>
      </div>

      <ContractedWizard clientId={user.id} />
    </div>
  )
}
