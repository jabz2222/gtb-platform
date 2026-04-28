import { Metadata } from 'next'
import ContactForm from '@/components/marketing/ContactForm'
import EnquiryCarousel from '@/components/marketing/EnquiryCarousel'

export const metadata: Metadata = { title: 'Contact GTB Development' }

const INFO_ITEMS = [
  {
    label: 'Location',
    value: 'South East London, UK',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'info@gtbdevelopment.co.uk',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'Response Time',
    value: 'Within 24 hours',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">Get in Touch</p>
        <h1
          className="text-5xl font-black tracking-tight text-white uppercase mb-4"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Contact <span style={{ color: '#C9A84C' }}>GTB</span>
        </h1>
        <p className="text-[#555] text-sm max-w-md">
          Have a question about our programmes? Want to join the ecosystem?
          We&apos;d love to hear from you.
        </p>
      </div>

      {/* Enquiry Info */}
      <div className="mb-12 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Before You Enquire
          </span>
        </div>
        <div className="p-6 space-y-8">
          <p className="text-sm text-[#888] leading-relaxed">
            We welcome enquiries from parents, participants, schools, and organisations.
            Select the type of enquiry that best matches your situation — each one explains what we can help with and what to include in your message.
          </p>

          {/* Enquiry Type Carousel */}
          <EnquiryCarousel />

          {/* What to Expect */}
          <div className="border-t border-white/5 pt-6">
            <h3 className="text-xs tracking-[0.2em] uppercase text-white mb-4">What Happens Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '01', title: 'Submit your enquiry', body: 'Fill in the form below. Use the guidance above to include the right details — it helps us respond faster and more accurately.' },
                { step: '02', title: 'We review & respond', body: 'A member of the GTB team will respond within 24 hours. We\'ll answer your question directly or arrange a follow-up call if needed.' },
                { step: '03', title: 'Get started', body: 'We\'ll guide you through the next steps — whether that\'s booking a trial, arranging a meeting, or sending over a programme overview.' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="text-[#C9A84C] text-xs font-bold mt-0.5 flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="text-sm text-white mb-1">{s.title}</p>
                    <p className="text-xs text-[#555] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent / Safeguarding note */}
          <div className="border-t border-white/5 pt-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#C9A84C]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <p className="text-xs text-[#555] leading-relaxed">
              <span className="text-[#888]">For urgent matters,</span> email us directly at{' '}
              <a href="mailto:info@gtbdevelopment.co.uk" className="text-[#C9A84C] hover:underline">
                info@gtbdevelopment.co.uk
              </a>
              . For safeguarding concerns, please state this clearly in your message and it will be prioritised immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
              Send a Message
            </span>
          </div>
          <div className="p-6">
            <ContactForm />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          {INFO_ITEMS.map(item => (
            <div
              key={item.label}
              className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                              text-[#C9A84C] flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] text-[#444] uppercase tracking-wider mb-0.5">
                  {item.label}
                </p>
                <p className="text-sm text-white">{item.value}</p>
              </div>
            </div>
          ))}

          {/* Divisions quick links */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
                Our Divisions
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { name: 'Football',  color: '#5BB8E8', slug: 'football'  },
                { name: 'Fitness',   color: '#2E8B35', slug: 'fitness'   },
                { name: 'Sports',    color: '#E8641A', slug: 'sports'    },
                { name: 'Mentoring', color: '#9B2454', slug: 'mentoring' },
                { name: 'Education', color: '#CC2222', slug: 'education' },
              ].map(d => (
                <a
                  key={d.name}
                  href={`/divisions/${d.slug}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-[#666] hover:text-white transition-colors">
                    GTB {d.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
