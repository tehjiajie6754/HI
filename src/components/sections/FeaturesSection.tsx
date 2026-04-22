'use client'

import { motion } from 'framer-motion'
import { Bot, ScanFace, CalendarDays, HeadphonesIcon, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const features = [
  {
    icon: Bot,
    titleKey: 'features.ai.title',
    descKey: 'features.ai.desc',
    gradient: 'from-[var(--color-gold)] to-[var(--color-gold-dark)]',
  },
  {
    icon: ScanFace,
    titleKey: 'features.face.title',
    descKey: 'features.face.desc',
    gradient: 'from-[#1A1A2E] to-[#2d2d4e]',
  },
  {
    icon: CalendarDays,
    titleKey: 'features.booking.title',
    descKey: 'features.booking.desc',
    gradient: 'from-[var(--color-gold-dark)] to-[#8a7030]',
  },
  {
    icon: HeadphonesIcon,
    titleKey: 'features.concierge.title',
    descKey: 'features.concierge.desc',
    gradient: 'from-[#2d2d4e] to-[var(--color-charcoal)]',
  },
]

export default function FeaturesSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 sm:py-24 bg-[var(--color-cream)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)] mb-4"
          >
            Why Zen Travel
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-semibold text-[var(--color-charcoal)] mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
          >
            {t('features.subtitle')}
          </motion.p>
          <div className="mx-auto mt-4 w-12 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-[var(--color-white)] border border-[var(--color-stone)] rounded-2xl p-6 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3
                className="text-base font-semibold text-[var(--color-charcoal)] mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                {t(feature.descKey)}
              </p>

              <div className="flex items-center text-xs font-semibold text-[var(--color-gold)] group-hover:gap-2 transition-all duration-200">
                Learn more
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
