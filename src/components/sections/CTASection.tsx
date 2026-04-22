'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { ArrowRight, Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const testimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Singapore',
    content: 'Zen Travel planned my Japan trip in minutes. The AI suggestions were spot-on, and the face check-in made the whole experience seamless.',
    rating: 5,
    destination: 'Tokyo, Japan',
    initials: 'PS',
  },
  {
    id: '2',
    name: 'James Whitfield',
    location: 'Kuala Lumpur',
    content: 'I have travelled to over 30 countries, and Zen Travel is the most refined planning tool I have ever used. Absolutely luxurious experience.',
    rating: 5,
    destination: 'Santorini, Greece',
    initials: 'JW',
  },
  {
    id: '3',
    name: 'Mei Ling Tan',
    location: 'Penang',
    content: 'The AI chatbot understood exactly what I wanted and created an itinerary that felt like it was designed by a personal travel consultant.',
    rating: 5,
    destination: 'Maldives',
    initials: 'ML',
  },
]

export default function CTASection() {
  const { t } = useLanguage()

  return (
    <>
      {/* Testimonials */}
      <section className="py-20 bg-[var(--color-white)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)] mb-3 block">Testimonials</span>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-[var(--color-charcoal)] mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {t('testimonials.title')}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">{t('testimonials.subtitle')}</p>
            <div className="mx-auto mt-4 w-12 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t_item, index) => (
              <motion.div
                key={t_item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-[var(--color-cream)] border border-[var(--color-stone)] rounded-2xl p-6 hover:shadow-[var(--shadow-md)] transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t_item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 italic">
                  &ldquo;{t_item.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{t_item.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-charcoal)]">{t_item.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t_item.location} · {t_item.destination}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--color-charcoal)] relative overflow-hidden">
        {/* Decorative gold rings */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-[var(--color-gold)]/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full border border-[var(--color-gold)]/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)] mb-4 block"
          >
            Start Today
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-semibold text-white mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('cta.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-10 max-w-lg mx-auto"
          >
            {t('cta.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/onboarding">
              <Button
                variant="primary"
                size="xl"
                className="shadow-lg text-base"
              >
                {t('cta.button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
