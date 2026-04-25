import { NextResponse } from 'next/server'

function interpretCode(code: number, precip: number): {
  icon: string; description: string; suitability: 'best' | 'good' | 'fair' | 'avoid'; tip: string
} {
  if (code === 0 || code === 1)
    return { icon: '☀️', description: 'Clear & Sunny',     suitability: 'best',  tip: 'Excellent conditions all day — go early to beat the midday heat.' }
  if (code === 2)
    return { icon: '⛅', description: 'Partly Cloudy',     suitability: 'good',  tip: 'Good outdoor weather. Possible brief afternoon shower — bring sunscreen.' }
  if (code === 3)
    return { icon: '☁️', description: 'Overcast',           suitability: 'fair',  tip: 'Comfortable temperatures but grey skies. Morning visit recommended.' }
  if (code >= 45 && code <= 48)
    return { icon: '🌫️', description: 'Foggy',             suitability: 'fair',  tip: 'Fog may clear by mid-morning. Visibility could be low early on.' }
  if (code >= 51 && code <= 67)
    return { icon: '🌧️', description: 'Drizzle / Rain',    suitability: 'avoid', tip: 'Persistent rain — outdoor activities not ideal.' }
  if (code >= 80 && code <= 82)
    return { icon: '🌦️', description: 'Rain Showers',      suitability: precip > 8 ? 'avoid' : 'fair', tip: precip > 8 ? 'Heavy showers — not recommended for outdoor parks.' : 'Afternoon showers likely. Visit in the morning before noon.' }
  if (code >= 95)
    return { icon: '⛈️', description: 'Thunderstorm',      suitability: 'avoid', tip: 'Thunderstorm risk — outdoor parks may close. Choose an indoor alternative.' }
  return   { icon: '⛅', description: 'Variable',          suitability: 'fair',  tip: 'Mixed conditions. Plan for a morning visit and monitor the forecast.' }
}

const FALLBACK = [
  { dayNum: 1, date: '2026-05-16', label: 'Sat, May 16', weatherCode: 80, tempMax: 33, tempMin: 27, precipMm: 9.2,  icon: '🌦️', description: 'Rain Showers',   suitability: 'fair'  as const, tip: 'Afternoon showers likely. Morning visit recommended.' },
  { dayNum: 2, date: '2026-05-17', label: 'Sun, May 17', weatherCode: 2,  tempMax: 34, tempMin: 28, precipMm: 1.0,  icon: '⛅',  description: 'Partly Cloudy',  suitability: 'good'  as const, tip: 'Good outdoor weather. Possible brief afternoon shower.' },
  { dayNum: 3, date: '2026-05-18', label: 'Mon, May 18', weatherCode: 1,  tempMax: 35, tempMin: 28, precipMm: 0.2,  icon: '☀️',  description: 'Clear & Sunny',  suitability: 'best'  as const, tip: 'Excellent conditions all day — go early to beat the midday heat.' },
  { dayNum: 4, date: '2026-05-19', label: 'Tue, May 19', weatherCode: 95, tempMax: 31, tempMin: 27, precipMm: 20.5, icon: '⛈️',  description: 'Thunderstorm',   suitability: 'avoid' as const, tip: 'Thunderstorm risk — outdoor parks may close. Must depart by 5 PM.' },
]

const TRIP_DAYS = [
  { dayNum: 1, date: '2026-05-16', label: 'Sat, May 16' },
  { dayNum: 2, date: '2026-05-17', label: 'Sun, May 17' },
  { dayNum: 3, date: '2026-05-18', label: 'Mon, May 18' },
  { dayNum: 4, date: '2026-05-19', label: 'Tue, May 19' },
]

export async function GET() {
  try {
    // Use 2025 historical archive as proxy for 2026 (Open-Meteo free, no key needed).
    const url =
      'https://archive-api.open-meteo.com/v1/archive' +
      '?latitude=5.4141&longitude=100.3288' +
      '&start_date=2025-05-16&end_date=2025-05-19' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum' +
      '&timezone=Asia%2FKuala_Lumpur'

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const raw = await res.json()
    const d = raw.daily
    if (!d?.weathercode?.length) throw new Error('empty payload')

    const days = TRIP_DAYS.map((day, i) => {
      const code   = d.weathercode[i]        ?? 2
      const precip = d.precipitation_sum[i]  ?? 2
      return {
        ...day,
        weatherCode: code,
        tempMax:  Math.round(d.temperature_2m_max[i] ?? 33),
        tempMin:  Math.round(d.temperature_2m_min[i] ?? 27),
        precipMm: Math.round(precip * 10) / 10,
        ...interpretCode(code, precip),
      }
    })

    return NextResponse.json({ source: 'Open-Meteo 2025 historical reference', days })
  } catch {
    return NextResponse.json({ source: 'Penang May climate estimate', days: FALLBACK })
  }
}
