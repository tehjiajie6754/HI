'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-[var(--color-charcoal)]/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-charcoal)]/60 via-transparent to-[var(--color-charcoal)]/80" />

      {/* Decorative elements */}
      <div className="absolute top-12 right-12 text-[var(--color-gold)]/60 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute bottom-12 left-12 text-[var(--color-gold)]/40 animate-bounce">
        <MapPin className="w-6 h-6" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[var(--color-gold)]/20 backdrop-blur-sm text-[var(--color-gold)] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[var(--color-gold)]/30"
            >
              <Sparkles className="w-4 h-4" />
              {t('hero.badge')}
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-semibold text-white mb-6 leading-tight drop-shadow-lg"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="text-[var(--color-gold)]">{t('hero.title.main')}</span>
              <br />
              <span className="text-white">{t('hero.title.sub')}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl"
            >
              {t('hero.description.main')}
              <br />
              <span className="text-[var(--color-gold)]/90 font-medium">{t('hero.description.sub')}</span>
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link href="/onboarding">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-lg"
                >
                  {t('hero.button')}
                </Button>
              </Link>
              <div className="mt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <span className="text-[var(--color-gold)]">✓</span>
                  {t('hero.benefit.ai')}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[var(--color-gold)]">✓</span>
                  {t('hero.benefit.secure')}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-[var(--color-white)]/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-[var(--color-stone)] hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-[var(--color-charcoal)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Your Next Journey
                </h3>
                <span className="text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20 px-2 py-1 rounded-full font-medium">AI Crafted</span>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { day: 'Day 1', activity: 'Arrive in Tokyo', detail: 'Shinjuku check-in, evening ramen' },
                  { day: 'Day 2', activity: 'Kyoto temples', detail: 'Fushimi Inari, Arashiyama' },
                  { day: 'Day 3', activity: 'Mt. Fuji day trip', detail: 'Hakone views, hot spring' },
                ].map((item) => (
                  <div key={item.day} className="flex gap-3 p-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-stone)]">
                    <div className="flex-shrink-0 w-14 text-center">
                      <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wide">{item.day}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-charcoal)]">{item.activity}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-xs text-[var(--color-text-muted)]">
                  <span className="font-medium text-[var(--color-charcoal)]">AI-personalised</span> · Updated in real-time
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
