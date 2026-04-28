import type { Variants } from 'framer-motion'

const ease = [0.25, 0.1, 0.25, 1] as const

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease } },
}

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
}

export const navEntrance: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
}

export const mobileMenuOverlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const mobileMenuItem: Variants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
}

export const dropdownVariant: Variants = {
  hidden:  { opacity: 0, scaleY: 0.92, transformOrigin: 'top' },
  visible: { opacity: 1, scaleY: 1, transition: { duration: 0.2, ease } },
  exit:    { opacity: 0, scaleY: 0.95, transition: { duration: 0.15 } },
}
