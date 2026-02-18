from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.models import Prompt, PromptVersion
    from backend.schemas import PromptCreate, PromptResponse, PromptVersionCreate, PromptVersionResponse
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from database import get_db
    from models import Prompt, PromptVersion
    from schemas import PromptCreate, PromptResponse, PromptVersionCreate, PromptVersionResponse

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)) -> Prompt:
    prompt = Prompt(name=payload.name)
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.post("/{id}/version", response_model=PromptVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt_version(id: UUID, payload: PromptVersionCreate, db: Session = Depends(get_db)) -> PromptVersion:
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    latest_version: int = (
        db.query(func.max(PromptVersion.version_number)).filter(PromptVersion.prompt_id == id).scalar() or 0
    )
    version = PromptVersion(
        prompt_id=id,
        version_number=latest_version + 1,
        content=payload.content,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version
