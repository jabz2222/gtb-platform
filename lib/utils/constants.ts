export const ROLES = ['admin', 'staff', 'mentor', 'educator', 'client', 'minor'] as const

// Onboarding Google Form URL — set NEXT_PUBLIC_ONBOARDING_FORM_URL in .env.local
export const ONBOARDING_FORM_URL = process.env.NEXT_PUBLIC_ONBOARDING_FORM_URL ?? ''

export const DIVISIONS = {
  football: {
    name: 'GTB Football',
    color: '#5BB8E8',
    tagline: 'Develop the Player. Build the Person.',
    description: 'Technical football coaching from U5 to U15+',
  },
  fitness: {
    name: 'GTB Fitness',
    color: '#2E8B35',
    tagline: 'Stronger Body. Stronger Mind.',
    description: 'Youth strength & conditioning, ages 8–18',
  },
  sports: {
    name: 'GTB Sports',
    color: '#E8641A',
    tagline: 'Every Sport. One Standard.',
    description: 'Multi-sport participation and skills development',
  },
} as const

export const CROSS_DIVISION_SERVICES = {
  mentoring: {
    name: 'GTB Mentoring',
    colorMentor: '#9B2454',
    colorMentoring: '#2E9B8A',
    tagline: 'Guide the Mind. Shape the Future.',
  },
  education: {
    name: 'GTB Education',
    color: '#CC2222',
    tagline: 'Learn Today. Lead Tomorrow.',
  },
} as const

export const BRAND_COLORS = {
  black:  '#0A0A0A',
  gold:   '#C9A84C',
  white:  '#FFFFFF',
  silver: '#CCCCCC',
} as const

export const BOOKING_TYPES = {
  contracted:    'Contracted Period',
  one_on_one:    '1-on-1 Session',
  group_public:  'Group Class (Public)',
  group_private: 'Group Class (Private)',
} as const

export const BOOKING_STATUSES = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show:   'No Show',
} as const

// Cancellation policy
export const CANCELLATION_POLICY = {
  noticePeriodHours: 24,
  breachRefundPercent: 50,   // 50% of deposit returned as credit if <24hr notice
  fullRefundPercent: 100,    // 100% returned as credit if >=24hr notice
} as const

// GTB 4D Model — the developmental architecture of the organisation
export const FOUR_D_MODEL = [
  {
    key: 'drive',
    name: 'Drive',
    description: 'Internal motivation, discipline, and ownership. The behavioural foundation of all development.',
    short: 'Motivation, ownership & the mindset to lead your own development.',
    color: '#C9A84C',
  },
  {
    key: 'decision',
    name: 'Decision',
    description: 'Awareness, cognition, and adaptability. Linking knowledge to action under pressure.',
    short: 'Intelligence, awareness & the ability to read any situation.',
    color: '#5BB8E8',
  },
  {
    key: 'delivery',
    name: 'Delivery',
    description: 'Quality execution and applied performance. Where Drive and Decision become visible.',
    short: 'Technical execution, precision & consistency under pressure.',
    color: '#2E8B35',
  },
  {
    key: 'durability',
    name: 'Durability',
    description: 'Physical robustness and psychological resilience. The sustainability layer that protects long-term growth.',
    short: 'Physical & psychological resilience to sustain long-term growth.',
    color: '#E8641A',
  },
] as const

// GTB Values — the behavioural DNA of the organisation
export const GTB_VALUES = [
  {
    title: 'Courage & Creativity',
    body: 'Stepping into discomfort — attempting new skills, taking responsibility in pressure moments, and expressing individuality within structure.',
    color: '#C9A84C',
  },
  {
    title: 'Proactivity & Resilience',
    body: 'Acting before being told and responding constructively to setbacks. Mistakes are learning data, not failure.',
    color: '#5BB8E8',
  },
  {
    title: 'Respect & Integrity',
    body: 'Dignity in every interaction. Alignment between words and actions. Performance never overrides respect.',
    color: '#2E8B35',
  },
  {
    title: 'Accountability & Ownership',
    body: 'Responsibility for effort, preparation, behaviour, and reflection. Blame is not a development strategy — ownership is.',
    color: '#E8641A',
  },
  {
    title: 'Teamwork & Discipline',
    body: 'Understanding your role within the group and executing it consistently. Discipline creates freedom; structure enables expression.',
    color: '#9B2454',
  },
  {
    title: 'Perseverance & Patience',
    body: 'Mastery is long-term. Development requires repetition, deliberate practice, and the emotional control to stay the course.',
    color: '#CC2222',
  },
  {
    title: 'Humility & Precision',
    body: 'Relentless refinement of fundamentals. Humility keeps learning active; precision ensures progress.',
    color: '#C9A84C',
  },
  {
    title: 'Passion & Enjoyment',
    body: 'Engagement fuels performance. When participants enjoy the process, motivation stabilises and effort increases.',
    color: '#5BB8E8',
  },
  {
    title: 'Adaptability & Versatility',
    body: 'Prepared for evolving environments. Modern sport demands tactical flexibility, positional awareness, and psychological agility.',
    color: '#2E8B35',
  },
  {
    title: 'Empathy & Sportsmanship',
    body: 'How you compete matters. Winning with humility, losing with composure, and respecting everyone in the arena.',
    color: '#E8641A',
  },
] as const

// All monetary values stored in pence (integers)
export function poundsToP(pounds: number): number {
  return Math.round(pounds * 100)
}

export function pToPounds(pence: number): number {
  return pence / 100
}

export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}
