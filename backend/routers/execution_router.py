from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.schemas import (
        EvaluationResponse,
        ExecutionResponse,
        ExecutionWithEvaluationResponse,
        ListEvaluationsResponse,
        ListExecutionsResponse,
    )
    from backend.services.execution_service import ExecutionServiceError, NotFoundError, execution_service
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from database import get_db
    from schemas import (
        EvaluationResponse,
        ExecutionResponse,
        ExecutionWithEvaluationResponse,
        ListEvaluationsResponse,
        ListExecutionsResponse,
    )
    from services.execution_service import ExecutionServiceError, NotFoundError, execution_service

router = APIRouter(tags=["executions"])


@router.post("/execute/{version_id}", response_model=ExecutionWithEvaluationResponse, status_code=status.HTTP_201_CREATED)
async def execute_prompt(version_id: UUID, db: Session = Depends(get_db)) -> ExecutionWithEvaluationResponse:
    try:
        execution, evaluation = await execution_service.execute_prompt_version(version_id=version_id, db=db)
        return ExecutionWithEvaluationResponse(
            execution=ExecutionResponse.model_validate(execution),
            evaluation={
                "accuracy_score": evaluation.accuracy_score,
                "clarity_score": evaluation.clarity_score,
                "hallucination_score": evaluation.hallucination_score,
                "overall_score": evaluation.overall_score,
            },
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ExecutionServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.get("/executions", response_model=ListExecutionsResponse)
async def get_executions(db: Session = Depends(get_db)) -> ListExecutionsResponse:
    executions = execution_service.list_executions(db)
    return ListExecutionsResponse(executions=[ExecutionResponse.model_validate(item) for item in executions])


@router.get("/evaluations", response_model=ListEvaluationsResponse)
async def get_evaluations(db: Session = Depends(get_db)) -> ListEvaluationsResponse:
    evaluations = execution_service.list_evaluations(db)
    return ListEvaluationsResponse(evaluations=[EvaluationResponse.model_validate(item) for item in evaluations])
