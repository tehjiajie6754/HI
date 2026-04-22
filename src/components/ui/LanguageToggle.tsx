'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ms' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-stone)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
      title={`Switch to ${language === 'en' ? 'Bahasa Malaysia' : 'English'}`}
    >
      <span>{language === 'en' ? '🇬🇧' : '🇲🇾'}</span>
      <span>{t('language.switch')}</span>
    </button>
  )
}
