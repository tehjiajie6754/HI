'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'ms'

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.plan-trip': 'Plan Trip',
    'nav.onboarding': 'Get Started',
    'nav.profile': 'Profile',
    'nav.logout': 'Sign Out',

    // Hero
    'hero.badge': 'AI-Powered Travel Planning',
    'hero.title.main': 'Your Journey,',
    'hero.title.sub': 'Perfectly Crafted.',
    'hero.description.main': 'Discover the world with personalised AI itineraries, expert curation, and seamless booking.',
    'hero.description.sub': 'Every trip, an unforgettable story.',
    'hero.button': 'Start Planning',
    'hero.benefit.ai': 'AI Itinerary Builder',
    'hero.benefit.secure': 'Secure Face Check-in',

    // Features
    'features.title': 'Travel Smarter, Travel Better',
    'features.subtitle': 'Everything you need to plan and experience the perfect journey.',
    'features.ai.title': 'AI Itinerary Planning',
    'features.ai.desc': 'Tell us your dream and our AI crafts a bespoke day-by-day itinerary tailored to your style.',
    'features.face.title': 'Face Recognition Check-in',
    'features.face.desc': 'Secure, instant identity verification powered by AWS Rekognition — no queues, no hassle.',
    'features.booking.title': 'Smart Booking',
    'features.booking.desc': 'Hotels, flights, experiences — book everything in one place with real-time availability.',
    'features.concierge.title': '24/7 Travel Concierge',
    'features.concierge.desc': 'Our AI travel assistant is always on hand to answer questions and refine your plans.',

    // CTA
    'cta.title': 'Ready to Explore?',
    'cta.subtitle': 'Join thousands of travellers who plan smarter with Zen Travel.',
    'cta.button': 'Begin Your Journey',

    // Testimonials
    'testimonials.title': 'Stories from Our Travellers',
    'testimonials.subtitle': 'Real experiences from real people who discovered the world with Zen Travel.',

    // Onboarding
    'onboarding.business_setup': 'Traveller Onboarding',
    'onboarding.step_of': 'Step {current} of {total}',
    'onboarding.step1.title': 'Your Profile',
    'onboarding.step1.subtitle': 'Identity',
    'onboarding.step1.description': 'Tell us about yourself',
    'onboarding.step2.title': 'Preferences',
    'onboarding.step2.subtitle': 'Travel Style',
    'onboarding.step2.description': 'Your dream destinations',
    'onboarding.step3.title': 'Verification',
    'onboarding.step3.subtitle': 'Identity Check',
    'onboarding.step3.description': 'Secure your account',
    'onboarding.step4.title': 'Payment',
    'onboarding.step4.subtitle': 'Billing Setup',
    'onboarding.step4.description': 'Set up payment method',
    'onboarding.reset': 'Reset',
    'onboarding.save': 'Save',
    'onboarding.check': 'Check',
    'onboarding.click_any_step': 'Click any step to navigate',

    // Chatbot
    'chatbot.greeting': 'Hello! I\'m your Zen Travel concierge. Where would you like to go? ✈️',
    'chatbot.placeholder': 'Ask me anything about travel...',
    'chatbot.error': 'I\'m having trouble connecting. Please try again in a moment.',
    'chatbot.thinking': 'Planning your adventure...',

    // Face Liveness
    'liveness.title': 'Face Verification',
    'liveness.subtitle': 'Live presence verification',
    'liveness.camera_required': 'Camera Access Required',
    'liveness.camera_desc': 'We need camera access to verify your identity',
    'liveness.start': 'Start Verification',
    'liveness.success': 'Verification Successful!',
    'liveness.success_desc': 'Your identity has been successfully verified',
    'liveness.continue': 'Continue',
    'liveness.failed': 'Verification Failed',
    'liveness.failed_desc': 'Unable to verify your identity. Please try again.',
    'liveness.retry': 'Try Again',
    'liveness.cancel': 'Cancel',
    'liveness.blink': 'Please blink twice slowly',
    'liveness.smile': 'Please smile for 2 seconds',
    'liveness.turn_head': 'Turn your head left, then right',
    'liveness.look_up_down': 'Look up, then look down',
    'liveness.follow': 'Follow the instruction above to continue',

    // Footer
    'footer.copyright': '© 2025 Zen Travel. All rights reserved. Curated Journeys, Crafted for You.',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.tagline': 'Effortless • Luxurious • Unforgettable',
    'auth.begin': 'Begin Your Journey',

    // Language toggle
    'language': 'en',
    'language.switch': 'BM',
  },
  ms: {
    // Nav
    'nav.home': 'Utama',
    'nav.plan-trip': 'Rancang Perjalanan',
    'nav.onboarding': 'Mulakan',
    'nav.profile': 'Profil',
    'nav.logout': 'Log Keluar',

    // Hero
    'hero.badge': 'Perancangan Perjalanan Berkuasa AI',
    'hero.title.main': 'Perjalanan Anda,',
    'hero.title.sub': 'Direka Sempurna.',
    'hero.description.main': 'Temui dunia dengan itinerari AI yang diperibadikan, kurasi pakar, dan tempahan lancar.',
    'hero.description.sub': 'Setiap perjalanan, satu cerita yang tidak terlupakan.',
    'hero.button': 'Mula Merancang',
    'hero.benefit.ai': 'Pembina Itinerari AI',
    'hero.benefit.secure': 'Daftar Masuk Muka Selamat',

    // Features
    'features.title': 'Perjalanan Lebih Bijak, Lebih Baik',
    'features.subtitle': 'Semua yang anda perlukan untuk merancang dan mengalami perjalanan sempurna.',
    'features.ai.title': 'Perancangan Itinerari AI',
    'features.ai.desc': 'Beritahu kami impian anda dan AI kami mencipta itinerari hari demi hari yang bespoke.',
    'features.face.title': 'Daftar Masuk Pengecaman Wajah',
    'features.face.desc': 'Pengesahan identiti segera dan selamat, tanpa beratur, tanpa masalah.',
    'features.booking.title': 'Tempahan Pintar',
    'features.booking.desc': 'Hotel, penerbangan, pengalaman — tempah semua dalam satu tempat.',
    'features.concierge.title': 'Konsieur Perjalanan 24/7',
    'features.concierge.desc': 'Pembantu perjalanan AI kami sentiasa bersedia untuk menjawab soalan anda.',

    // CTA
    'cta.title': 'Bersedia untuk Menjelajah?',
    'cta.subtitle': 'Sertai ribuan pengembara yang merancang lebih bijak dengan Zen Travel.',
    'cta.button': 'Mulakan Perjalanan Anda',

    // Testimonials
    'testimonials.title': 'Cerita dari Pengembara Kami',
    'testimonials.subtitle': 'Pengalaman nyata dari orang nyata yang menemui dunia dengan Zen Travel.',

    // Onboarding
    'onboarding.business_setup': 'Pendaftaran Pengembara',
    'onboarding.step_of': 'Langkah {current} dari {total}',
    'onboarding.step1.title': 'Profil Anda',
    'onboarding.step1.subtitle': 'Identiti',
    'onboarding.step1.description': 'Ceritakan tentang diri anda',
    'onboarding.step2.title': 'Keutamaan',
    'onboarding.step2.subtitle': 'Gaya Perjalanan',
    'onboarding.step2.description': 'Destinasi impian anda',
    'onboarding.step3.title': 'Pengesahan',
    'onboarding.step3.subtitle': 'Semakan Identiti',
    'onboarding.step3.description': 'Selamatkan akaun anda',
    'onboarding.step4.title': 'Pembayaran',
    'onboarding.step4.subtitle': 'Persediaan Bil',
    'onboarding.step4.description': 'Sediakan kaedah pembayaran',
    'onboarding.reset': 'Set Semula',
    'onboarding.save': 'Simpan',
    'onboarding.check': 'Semak',
    'onboarding.click_any_step': 'Klik mana-mana langkah untuk navigasi',

    // Chatbot
    'chatbot.greeting': 'Hai! Saya konsieur perjalanan Zen Travel anda. Ke mana anda ingin pergi? ✈️',
    'chatbot.placeholder': 'Tanya saya apa sahaja tentang perjalanan...',
    'chatbot.error': 'Saya menghadapi masalah sambungan. Sila cuba lagi.',
    'chatbot.thinking': 'Merancang pengembaraan anda...',

    // Face Liveness
    'liveness.title': 'Pengesahan Wajah',
    'liveness.subtitle': 'Pengesahan kehadiran langsung',
    'liveness.camera_required': 'Akses Kamera Diperlukan',
    'liveness.camera_desc': 'Kami memerlukan akses kamera untuk mengesahkan identiti anda',
    'liveness.start': 'Mula Pengesahan',
    'liveness.success': 'Pengesahan Berjaya!',
    'liveness.success_desc': 'Identiti anda telah berjaya disahkan',
    'liveness.continue': 'Teruskan',
    'liveness.failed': 'Pengesahan Gagal',
    'liveness.failed_desc': 'Tidak dapat mengesahkan identiti anda. Sila cuba lagi.',
    'liveness.retry': 'Cuba Lagi',
    'liveness.cancel': 'Batal',
    'liveness.blink': 'Sila kelip mata dua kali perlahan-lahan',
    'liveness.smile': 'Sila senyum selama 2 saat',
    'liveness.turn_head': 'Pusing kepala ke kiri, kemudian ke kanan',
    'liveness.look_up_down': 'Pandang ke atas, kemudian ke bawah',
    'liveness.follow': 'Ikuti arahan di atas untuk meneruskan',

    // Footer
    'footer.copyright': '© 2025 Zen Travel. Hak cipta terpelihara. Perjalanan Terkurasi, Direka untuk Anda.',

    // Auth
    'auth.login': 'Log Masuk',
    'auth.register': 'Buat Akaun',
    'auth.tagline': 'Mudah • Mewah • Tidak Terlupakan',
    'auth.begin': 'Mulakan Perjalanan Anda',

    // Language toggle
    'language': 'ms',
    'language.switch': 'EN',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
