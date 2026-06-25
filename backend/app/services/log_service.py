"""System log recording and retrieval for admin audit trail.

Transaction Ranking System — Vineet Kumar
"""
import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import SystemLog


def record_log(
    db: Session,
    *,
    category: str,
    message: str,
    level: str = "info",
    user_email: str | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        SystemLog(
            level=level,
            category=category,
            message=message,
            user_email=user_email,
            metadata_json=json.dumps(metadata) if metadata else None,
            created_at=datetime.utcnow(),
        )
    )
    db.commit()


def get_logs(
    db: Session,
    *,
    category: str | None = None,
    level: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[SystemLog], int]:
    query = db.query(SystemLog).order_by(SystemLog.created_at.desc())
    if category:
        query = query.filter(SystemLog.category == category)
    if level:
        query = query.filter(SystemLog.level == level)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            SystemLog.message.ilike(term) | SystemLog.user_email.ilike(term)
        )
    total = query.count()
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    return rows, total
