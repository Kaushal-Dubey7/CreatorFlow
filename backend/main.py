"""CreatorFlow AI — FastAPI Backend"""
import os
import json
import asyncio
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from store import store

app = FastAPI(title="CreatorFlow AI API", version="1.0.0")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Models ────────────────────────────────────────
class IdeateRequest(BaseModel):
    keyword: str


class ThumbnailRequest(BaseModel):
    title: str
    style: str = "gradient"  # gradient, minimal, bold


class PublishRequest(BaseModel):
    pipeline_id: str
    platforms: list[str]


class UpdatePipelineRequest(BaseModel):
    pipeline_id: str
    title: str | None = None
    script: str | None = None
    status: str | None = None
    progress: int | None = None


# ── Health Check ──────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CreatorFlow AI API",
        "timestamp": datetime.now().isoformat(),
    }


# ── Ideate Endpoint ──────────────────────────────────────
@app.post("/api/ideate")
async def ideate(request: IdeateRequest):
    """Generate a content brief using Claude API."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_anthropic_api_key_here":
        # Return realistic mock data when no API key is configured
        mock_brief = _generate_mock_brief(request.keyword)
        pipeline = store.create_pipeline(request.keyword, mock_brief)
        return {"brief": mock_brief, "pipeline_id": pipeline["id"], "source": "mock"}

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="""You are a content strategist. Given a topic, generate a structured content brief.
Return ONLY valid JSON with these exact keys:
{
  "hook": "A compelling 1-2 sentence hook to grab attention",
  "talkingPoints": ["Point 1", "Point 2", "Point 3"],
  "title": "A catchy, clickable title for the content",
  "script": "A complete 60-second video script (approximately 150 words)"
}
Do not include any text outside the JSON object.""",
            messages=[
                {
                    "role": "user",
                    "content": f"Generate a content brief about: {request.keyword}",
                }
            ],
        )

        response_text = message.content[0].text.strip()

        # Try to parse JSON from the response
        try:
            # Handle potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            brief = json.loads(response_text)
        except json.JSONDecodeError:
            brief = _generate_mock_brief(request.keyword)
            brief["_note"] = "AI response parsing failed, showing mock data"

        pipeline = store.create_pipeline(request.keyword, brief)
        return {"brief": brief, "pipeline_id": pipeline["id"], "source": "claude"}

    except Exception as e:
        # Fallback to mock data on any error
        mock_brief = _generate_mock_brief(request.keyword)
        pipeline = store.create_pipeline(request.keyword, mock_brief)
        return {
            "brief": mock_brief,
            "pipeline_id": pipeline["id"],
            "source": "mock",
            "error": str(e),
        }


def _generate_mock_brief(keyword: str) -> dict:
    """Generate realistic mock content brief when Claude API is unavailable."""
    return {
        "hook": f"Did you know that {keyword} is transforming how millions of people work and create? In the next 60 seconds, I'll show you exactly why this matters for YOUR content strategy.",
        "talkingPoints": [
            f"The explosive growth of {keyword} and why creators need to pay attention now",
            f"3 practical ways to leverage {keyword} in your content workflow today",
            f"The future landscape: how {keyword} will reshape the creator economy by 2026",
        ],
        "title": f"🚀 {keyword.title()}: The Ultimate Guide for Content Creators in 2025",
        "script": f"""Hey creators! Let me tell you something that's going to change your game completely.

{keyword.title()} isn't just a buzzword — it's the single biggest opportunity for content creators right now.

Here's what you need to know:

First, the numbers are insane. We're seeing a 340% increase in engagement for content about {keyword}. That's not a typo — three hundred and forty percent.

Second, you can start leveraging this TODAY. Whether you're on YouTube, Instagram, or TikTok, there are three simple strategies that top creators are already using.

And third — and this is the exciting part — we're just at the beginning. The creator economy around {keyword} is projected to hit $50 billion by 2026.

So here's my challenge to you: create ONE piece of content about {keyword} this week. Use the strategies I just shared. And watch what happens to your engagement.

Drop a comment below if you're in. Let's create together! 🎯""",
    }


# ── Thumbnail Endpoint ───────────────────────────────────
@app.post("/api/thumbnail")
async def generate_thumbnail(request: ThumbnailRequest):
    """Generate a thumbnail — returns SVG data for styled text overlay."""
    colors = {
        "gradient": {"bg1": "#7C3AED", "bg2": "#06B6D4", "text": "#FFFFFF"},
        "minimal": {"bg1": "#1a1a2e", "bg2": "#16213e", "text": "#FFFFFF"},
        "bold": {"bg1": "#EF4444", "bg2": "#F97316", "text": "#FFFFFF"},
    }

    style = colors.get(request.style, colors["gradient"])

    # Create a polished SVG thumbnail
    title_lines = _wrap_text(request.title, 28)
    title_y_start = 360 - (len(title_lines) * 32)

    title_elements = ""
    for i, line in enumerate(title_lines):
        y = title_y_start + i * 64
        title_elements += f'<text x="640" y="{y}" text-anchor="middle" fill="{style["text"]}" font-family="Inter, sans-serif" font-size="48" font-weight="800" letter-spacing="-0.02em">{_escape_xml(line)}</text>\n'

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{style['bg1']};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{style['bg2']};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:0" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0.6" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <!-- Decorative circles -->
  <circle cx="200" cy="150" r="300" fill="{style['bg1']}" opacity="0.3"/>
  <circle cx="1100" cy="600" r="250" fill="{style['bg2']}" opacity="0.3"/>
  <!-- Grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  </pattern>
  <rect width="1280" height="720" fill="url(#grid)"/>
  <rect width="1280" height="720" fill="url(#overlay)"/>
  <!-- CreatorFlow AI branding -->
  <text x="640" y="180" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Inter, sans-serif" font-size="20" font-weight="600" letter-spacing="0.15em">CREATORFLOW AI</text>
  <!-- Title -->
  {title_elements}
  <!-- Bottom bar -->
  <rect x="0" y="680" width="1280" height="40" fill="rgba(0,0,0,0.4)"/>
  <text x="40" y="706" fill="rgba(255,255,255,0.5)" font-family="Inter, sans-serif" font-size="16">creatorflow.ai</text>
</svg>"""

    return {
        "svg": svg,
        "width": 1280,
        "height": 720,
        "style": request.style,
    }


def _wrap_text(text: str, max_chars: int) -> list:
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        if len(current_line) + len(word) + 1 <= max_chars:
            current_line += (" " + word) if current_line else word
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    return lines[:3]  # Max 3 lines


def _escape_xml(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


# ── Publish Endpoint ─────────────────────────────────────
@app.post("/api/publish")
async def publish(request: PublishRequest):
    """Simulate publishing to platforms with delays."""
    pipeline = store.get_pipeline(request.pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    results = []
    for platform in request.platforms:
        # Simulate processing time
        await asyncio.sleep(0.3)
        results.append(
            {
                "platform": platform,
                "status": "published",
                "url": f"https://{platform}.com/creatorflow/{pipeline['id']}",
                "published_at": datetime.now().isoformat(),
            }
        )

    # Update pipeline
    import random
    store.update_pipeline(
        request.pipeline_id,
        {
            "status": "published",
            "progress": 100,
            "platforms": request.platforms,
            "views": random.randint(1000, 50000),
            "likes": random.randint(100, 5000),
            "shares": random.randint(50, 2000),
            "comments": random.randint(20, 500),
        },
    )

    return {"results": results, "pipeline_id": request.pipeline_id}


# ── Pipeline Endpoints ───────────────────────────────────
@app.get("/api/pipelines")
async def get_pipelines():
    return {"pipelines": store.get_pipelines()}


@app.get("/api/pipelines/{pipeline_id}")
async def get_pipeline(pipeline_id: str):
    pipeline = store.get_pipeline(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@app.put("/api/pipelines/{pipeline_id}")
async def update_pipeline(pipeline_id: str, request: UpdatePipelineRequest):
    updates = {k: v for k, v in request.model_dump().items() if v is not None and k != "pipeline_id"}
    pipeline = store.update_pipeline(pipeline_id, updates)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


# ── Analytics Endpoint ───────────────────────────────────
@app.get("/api/analytics")
async def get_analytics():
    return store.get_analytics()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
