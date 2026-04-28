import { format, formatDistanceToNow, isAfter, differenceInHours } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { CANCELLATION_POLICY } from './constants'

// Date formatting (UK)
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: enGB })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: enGB })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm', { locale: enGB })
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enGB })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

// Currency (GBP, values in pence)
export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}

// Cancellation policy helpers
export function isWithinCancellationWindow(sessionStart: Date | string): boolean {
  const hoursUntil = differenceInHours(new Date(sessionStart), new Date())
  return hoursUntil < CANCELLATION_POLICY.noticePeriodHours
}

export function getCancellationRefundPercent(sessionStart: Date | string): number {
  if (isWithinCancellationWindow(sessionStart)) {
    return CANCELLATION_POLICY.breachRefundPercent
  }
  return CANCELLATION_POLICY.fullRefundPercent
}

// Progress formatting
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// Name formatting
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
