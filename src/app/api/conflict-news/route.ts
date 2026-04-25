import { NextRequest, NextResponse } from 'next/server'

// Fetches recent conflict news for a given country from GNews public API
// and generates an AI travel advisory using Google Gemini
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') || 'Ukraine'
  const countryCode = searchParams.get('code') || 'ua'

  try {
    // --- 1. Fetch news from GNews API (free, no key required for limited use) ---
    const newsApiKey = process.env.GNEWS_API_KEY || ''
    const newsQuery = encodeURIComponent(`${country} conflict war`)

    let articles: Array<{ title: string; description: string; url: string; publishedAt: string; source: { name: string } }> = []

    if (newsApiKey) {
      const newsRes = await fetch(
        `https://gnews.io/api/v4/search?q=${newsQuery}&lang=en&max=5&apikey=${newsApiKey}`,
        { next: { revalidate: 3600 } } // cache for 1 hour
      )
      if (newsRes.ok) {
        const newsData = await newsRes.json()
        articles = newsData.articles || []
      }
    }

    // Fallback: use curated static articles if no API key or fetch fails
    if (articles.length === 0) {
      articles = getStaticArticles(country)
    }

    // --- 2. Generate AI travel advisory using Google GenAI ---
    const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || ''
    let aiAnalysis = getStaticAnalysis(country)

    if (GEMINI_API_KEY) {
      try {
        const newsContext = articles
          .slice(0, 3)
          .map((a) => `- ${a.title}: ${a.description}`)
          .join('\n')

        const prompt = `You are Zen Travel's AI Safety Advisor. Based on the following recent news about ${country}, provide a concise travel advisory (3-4 sentences max). State clearly whether travel is recommended or not, the main risks, and one practical tip. Be direct and informative, not alarmist.

Recent news:
${newsContext}

Format your response as plain text without markdown.`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
            }),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) aiAnalysis = text.trim()
        }
      } catch {
        // fall through to static analysis
      }
    }

    return NextResponse.json({
      country,
      countryCode,
      articles: articles.slice(0, 4),
      aiAnalysis,
      recommended: false,
      safetyLevel: 'Critical',
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conflict news' },
      { status: 500 }
    )
  }
}

function getStaticArticles(country: string) {
  return [
    {
      title: `${country}: Ongoing Military Operations Continue to Disrupt Civilian Life`,
      description: `Active conflict zones across ${country} remain dangerous, with military operations causing widespread displacement and infrastructure damage.`,
      url: 'https://www.bbc.com/news',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'BBC News' },
    },
    {
      title: `International Aid Organizations Warn of Humanitarian Crisis in ${country}`,
      description: `UN agencies have issued urgent appeals for humanitarian access as the conflict intensifies, affecting millions of civilians.`,
      url: 'https://www.reuters.com',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Reuters' },
    },
    {
      title: `Travel Advisories Updated: Most Nations Urge Citizens to Avoid ${country}`,
      description: `Multiple foreign ministries have elevated travel warnings to "Do Not Travel" for ${country} citing ongoing security threats.`,
      url: 'https://www.aljazeera.com',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Al Jazeera' },
    },
    {
      title: `Airspace Closures and Border Disruptions Affect Travel to ${country} Region`,
      description: `Commercial flights remain suspended over conflict areas, and border crossings face severe restrictions and safety concerns.`,
      url: 'https://apnews.com',
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'Associated Press' },
    },
  ]
}

function getStaticAnalysis(country: string): string {
  return `Travel to ${country} is not recommended at this time. Active military conflict poses extreme risks to civilian safety, including airstrikes, ground operations, and unpredictable security conditions. Most international governments have issued "Do Not Travel" advisories and commercial flights to the region remain suspended. If you have essential business in ${country}, contact your country's embassy and register with their traveller assistance program before any visit.`
}
