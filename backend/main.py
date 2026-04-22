from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import sys

# Allow imports from backend/src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

# Import modular chat router
try:
    from api.chat import router as chat_router
    CHAT_ROUTER_AVAILABLE = True
except ImportError:
    CHAT_ROUTER_AVAILABLE = False

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY", ""))
    model = genai.GenerativeModel("gemini-1.5-flash")
    AI_AVAILABLE = True
except Exception:
    AI_AVAILABLE = False

app = FastAPI(title="Zen Travel AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular chat router at /v2 (keeps backward compat with /api/chat inline route)
if CHAT_ROUTER_AVAILABLE:
    app.include_router(chat_router, prefix="/v2", tags=["chat-v2"])

SYSTEM_PROMPT = """You are the Zen Travel AI concierge — a world-class travel planning assistant. 
You help travellers plan luxurious, personalised itineraries for destinations worldwide.
You are knowledgeable about flights, hotels, local experiences, cultural etiquette, visa requirements, and travel tips.
Keep responses helpful, concise, and elegant. Use emojis sparingly. 
When suggesting itineraries, structure them day-by-day with morning, afternoon, and evening activities.
Always consider the traveller's budget, travel style, and interests when making recommendations."""

sessions: dict = {}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

@app.get("/")
def root():
    return {"status": "Zen Travel AI Backend running", "ai_available": AI_AVAILABLE}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not AI_AVAILABLE:
        return ChatResponse(
            response="AI service is not configured. Please add your GOOGLE_GENAI_API_KEY to the .env file. ✈️",
            session_id=request.session_id
        )
    try:
        history = []
        for msg in request.messages[:-1]:
            history.append({"role": "user" if msg.role == "user" else "model", "parts": [msg.content]})

        chat_session = model.start_chat(history=history)
        last_user_message = request.messages[-1].content
        full_message = f"{SYSTEM_PROMPT}\n\nUser: {last_user_message}" if not history else last_user_message
        response = chat_session.send_message(full_message)

        return ChatResponse(response=response.text, session_id=request.session_id)
    except Exception as e:
        return ChatResponse(
            response=f"I'm experiencing a temporary issue. Please try again in a moment. 🙏",
            session_id=request.session_id
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
