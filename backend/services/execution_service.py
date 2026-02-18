from uuid import UUID
from time import perf_counter

from sqlalchemy.orm import Session

try:
    from backend.models import Evaluation, Execution, PromptVersion
    from backend.services.evaluation_service import EvaluationServiceError, evaluation_service
    from backend.services.llm_service import LLMServiceError, llm_service
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from models import Evaluation, Execution, PromptVersion
    from services.evaluation_service import EvaluationServiceError, evaluation_service
    from services.llm_service import LLMServiceError, llm_service


class NotFoundError(Exception):
    pass


class ExecutionServiceError(Exception):
    pass


class ExecutionService:
    async def execute_prompt_version(self, version_id: UUID, db: Session) -> tuple[Execution, Evaluation]:
        prompt_version = db.query(PromptVersion).filter(PromptVersion.id == version_id).first()
        if not prompt_version:
            raise NotFoundError("Prompt version not found.")

        try:
            start_time = perf_counter()
            response_text = await llm_service.generate_text(prompt_version.content)
            response_time = perf_counter() - start_time

            execution = Execution(
                prompt_version_id=prompt_version.id,
                response_text=response_text,
                response_time=response_time,
            )
            db.add(execution)
            db.flush()

            eval_result = await evaluation_service.evaluate_response(response_text)

            evaluation = Evaluation(
                execution_id=execution.id,
                accuracy_score=eval_result.accuracy,
                clarity_score=eval_result.clarity,
                hallucination_score=eval_result.hallucination_risk,
                overall_score=eval_result.overall_score,
            )
            db.add(evaluation)
            db.commit()
            db.refresh(execution)
            db.refresh(evaluation)
            return execution, evaluation
        except (LLMServiceError, EvaluationServiceError) as exc:
            db.rollback()
            raise ExecutionServiceError(str(exc)) from exc
        except Exception as exc:
            db.rollback()
            raise ExecutionServiceError(f"Execution pipeline failed: {exc}") from exc

    @staticmethod
    def list_executions(db: Session) -> list[Execution]:
        return db.query(Execution).order_by(Execution.created_at.desc()).all()

    @staticmethod
    def list_evaluations(db: Session) -> list[Evaluation]:
        return db.query(Evaluation).order_by(Evaluation.created_at.desc()).all()


execution_service = ExecutionService()
