"""In-memory data store for the hackathon demo."""
import uuid
from datetime import datetime, timedelta
import random


class DataStore:
    def __init__(self):
        self.pipelines = {}
        self.content = {}
        self._seed_data()

    def _seed_data(self):
        """Pre-seed with demo pipelines."""
        seeds = [
            {
                "topic": "AI in Healthcare",
                "status": "creating",
                "progress": 60,
                "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "title": "How AI is Revolutionizing Healthcare in 2025",
                "platforms": ["youtube", "linkedin"],
                "views": 45200,
                "likes": 3100,
                "shares": 890,
                "comments": 234,
            },
            {
                "topic": "Remote Work Tips",
                "status": "ready",
                "progress": 100,
                "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "title": "Remote Work in 2025: The Ultimate Guide",
                "platforms": ["linkedin", "x"],
                "views": 32100,
                "likes": 2400,
                "shares": 560,
                "comments": 178,
            },
            {
                "topic": "Crypto Trends 2025",
                "status": "ideating",
                "progress": 25,
                "created_at": (datetime.now() - timedelta(minutes=5)).isoformat(),
                "title": "Crypto Trading for Beginners: 2025 Edition",
                "platforms": ["youtube", "tiktok"],
                "views": 28700,
                "likes": 1800,
                "shares": 420,
                "comments": 312,
            },
        ]

        for seed in seeds:
            pid = str(uuid.uuid4())[:8]
            self.pipelines[pid] = {
                "id": pid,
                **seed,
            }

    def create_pipeline(self, topic: str, content_brief: dict) -> dict:
        pid = str(uuid.uuid4())[:8]
        pipeline = {
            "id": pid,
            "topic": topic,
            "status": "ideating",
            "progress": 25,
            "created_at": datetime.now().isoformat(),
            "title": content_brief.get("title", topic),
            "content_brief": content_brief,
            "platforms": [],
            "views": 0,
            "likes": 0,
            "shares": 0,
            "comments": 0,
        }
        self.pipelines[pid] = pipeline
        return pipeline

    def update_pipeline(self, pid: str, updates: dict) -> dict:
        if pid in self.pipelines:
            self.pipelines[pid].update(updates)
        return self.pipelines.get(pid)

    def get_pipelines(self) -> list:
        return list(self.pipelines.values())

    def get_pipeline(self, pid: str) -> dict:
        return self.pipelines.get(pid)

    def get_analytics(self) -> dict:
        total_views = sum(p.get("views", 0) for p in self.pipelines.values())
        total_likes = sum(p.get("likes", 0) for p in self.pipelines.values())
        total_shares = sum(p.get("shares", 0) for p in self.pipelines.values())
        total_comments = sum(p.get("comments", 0) for p in self.pipelines.values())

        return {
            "overview": {
                "total_views": total_views,
                "views_change": 12.3,
                "total_likes": total_likes,
                "likes_change": 8.7,
                "total_shares": total_shares,
                "shares_change": 15.2,
                "total_comments": total_comments,
                "comments_change": -2.1,
            },
            "posts": [
                {
                    "id": p["id"],
                    "title": p.get("title", p["topic"]),
                    "platforms": p.get("platforms", []),
                    "views": p.get("views", 0),
                    "likes": p.get("likes", 0),
                    "shares": p.get("shares", 0),
                    "status": "live" if p.get("progress", 0) == 100 else "draft",
                    "created_at": p.get("created_at", ""),
                }
                for p in self.pipelines.values()
            ],
            "chart_data": [
                {"day": "Mon", "views": random.randint(3000, 8000)},
                {"day": "Tue", "views": random.randint(4000, 9000)},
                {"day": "Wed", "views": random.randint(5000, 12000)},
                {"day": "Thu", "views": random.randint(6000, 15000)},
                {"day": "Fri", "views": random.randint(8000, 18000)},
                {"day": "Sat", "views": random.randint(10000, 22000)},
                {"day": "Sun", "views": random.randint(12000, 25000)},
            ],
        }


# Singleton instance
store = DataStore()
