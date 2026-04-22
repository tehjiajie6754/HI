from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: str = ""


class ChatResponse(BaseModel):
    reply: str
    session_id: str


SYSTEM_PROMPT = """You are Zen, an AI travel concierge for Zen Travel — a luxury travel agency.
Your role is to help travellers plan personalised, unforgettable journeys.

You can help with:
- Itinerary planning for any destination worldwide
- Budget recommendations (budget, mid-range, luxury, ultra-luxury)
- Hotel, restaurant, and activity suggestions
- Visa and travel document advice
- Local customs and cultural tips
- Travel insurance and safety guidance
- Flight and transfer options

Always respond in a warm, knowledgeable, and slightly luxurious tone.
Keep responses concise but helpful. Use bullet points for lists.
When suggesting itineraries, include morning/afternoon/evening structure.
"""


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI travel concierge chat endpoint.
    Proxies to Google GenAI (gemini-pro) if configured, otherwise returns a fallback.
    """
    try:
        import google.generativeai as genai

        api_key = os.getenv("GOOGLE_GENAI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_GENAI_API_KEY not set")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-pro",
            system_instruction=SYSTEM_PROMPT,
        )

        # Build conversation history
        history = []
        for msg in request.messages[:-1]:  # all but last
            history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content],
            })

        chat_session = model.start_chat(history=history)
        last_user_msg = request.messages[-1].content if request.messages else "Hello"
        response = chat_session.send_message(last_user_msg)

        return ChatResponse(reply=response.text, session_id=request.session_id)

    except ImportError:
        return ChatResponse(
            reply="I'm currently unable to connect to the AI service. Please ensure `google-generativeai` is installed and GOOGLE_GENAI_API_KEY is configured.",
            session_id=request.session_id,
        )
    except Exception as e:
        # Graceful fallback with travel-themed response
        return ChatResponse(
            reply=f"I'm having trouble connecting right now. Please try again shortly, or contact our team at hello@zentravel.com. (Error: {str(e)[:80]})",
            session_id=request.session_id,
        )
