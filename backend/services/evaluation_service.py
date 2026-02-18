import json
import re
from dataclasses import dataclass

try:
    from backend.services.llm_service import LLMServiceError, llm_service
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from services.llm_service import LLMServiceError, llm_service


class EvaluationServiceError(Exception):
    pass


@dataclass
class EvaluationResult:
    accuracy: float
    clarity: float
    hallucination_risk: float
    overall_score: float


class EvaluationService:
    @staticmethod
    def _extract_json(text: str) -> dict[str, float]:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        payload = match.group(0) if match else text
        data = json.loads(payload)

        accuracy = float(data["accuracy"])
        clarity = float(data["clarity"])
        hallucination_risk = float(data["hallucination_risk"])

        return {
            "accuracy": max(0.0, min(100.0, accuracy)),
            "clarity": max(0.0, min(100.0, clarity)),
            "hallucination_risk": max(0.0, min(100.0, hallucination_risk)),
        }

    async def evaluate_response(self, response_text: str) -> EvaluationResult:
        eval_prompt = (
            "You are an LLM response evaluator. Score the following response on a 0-100 scale and "
            "return ONLY valid JSON in this exact format: "
            '{"accuracy": number, "clarity": number, "hallucination_risk": number}. '
            f"Response to evaluate: {response_text}"
        )

        try:
            raw = await llm_service.generate_text(eval_prompt)
            parsed = self._extract_json(raw)
        except (KeyError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise EvaluationServiceError(f"Invalid evaluation JSON from Gemini: {exc}") from exc
        except LLMServiceError as exc:
            raise EvaluationServiceError(str(exc)) from exc

        overall = (
            parsed["accuracy"] * 0.5
            + parsed["clarity"] * 0.3
            + (100.0 - parsed["hallucination_risk"]) * 0.2
        )

        return EvaluationResult(
            accuracy=parsed["accuracy"],
            clarity=parsed["clarity"],
            hallucination_risk=parsed["hallucination_risk"],
            overall_score=overall,
        )


evaluation_service = EvaluationService()
