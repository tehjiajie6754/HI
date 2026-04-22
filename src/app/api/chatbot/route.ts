import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, sessionId } = body

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, session_id: sessionId }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    // Fallback response when backend is not running
    return NextResponse.json({
      response: "I'm your Zen Travel AI concierge! To get full AI-powered itinerary suggestions, please start the FastAPI backend (`cd backend && uvicorn main:app`). In the meantime, feel free to explore our platform! ✈️",
      session_id: 'fallback',
    })
  }
}
