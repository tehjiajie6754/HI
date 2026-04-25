'use client'

import Link from 'next/link'
import { Compass, Globe2, Share2, Users, Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[var(--color-charcoal)] text-[var(--color-stone)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-xl font-semibold text-[var(--color-white)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Zen Travel
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              Curated journeys, crafted for discerning travellers who seek more than a destination.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-white)] mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'Plan a Trip', href: '/explore' },
                { label: 'Destinations', href: '/home' },
                { label: 'Travel Guides', href: '/home' },
                { label: 'About Us', href: '/home' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-white)] mb-4 uppercase tracking-wider">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: Globe2, label: 'Website' },
                { icon: Share2, label: 'Share' },
                { icon: Users, label: 'Community' },
                { icon: Mail, label: 'Email' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              hello@zentravel.com
            </p>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">{t('footer.copyright')}</p>
          <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
            <Link href="#" className="hover:text-[var(--color-gold)] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[var(--color-gold)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
