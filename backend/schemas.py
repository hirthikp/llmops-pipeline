from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PromptCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class PromptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    created_at: datetime


class PromptVersionCreate(BaseModel):
    content: str = Field(min_length=1)


class PromptVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    prompt_id: UUID
    version_number: int
    content: str
    created_at: datetime


class EvaluationScores(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    accuracy_score: float
    clarity_score: float
    hallucination_score: float
    overall_score: float


class ExecutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    prompt_version_id: UUID
    response_text: str
    response_time: float
    created_at: datetime


class ExecutionWithEvaluationResponse(BaseModel):
    execution: ExecutionResponse
    evaluation: EvaluationScores


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    execution_id: UUID
    accuracy_score: float
    clarity_score: float
    hallucination_score: float
    overall_score: float
    created_at: datetime


class ListExecutionsResponse(BaseModel):
    executions: list[ExecutionResponse]


class ListEvaluationsResponse(BaseModel):
    evaluations: list[EvaluationResponse]


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str
