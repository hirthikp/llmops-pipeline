import asyncio
import logging

import google.generativeai as genai

try:
    from backend.config import settings
except ModuleNotFoundError as exc:
    if exc.name != "backend":
        raise
    from config import settings

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    pass


class LLMService:
    def __init__(self) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model_name)
        self.timeout_seconds = settings.llm_timeout_seconds
        self.max_retries = settings.llm_max_retries

    async def generate_text(self, prompt: str) -> str:
        if not settings.gemini_api_key:
            raise LLMServiceError("GEMINI_API_KEY is not set.")

        last_error: Exception | None = None

        for attempt in range(self.max_retries + 1):
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(self.model.generate_content, prompt),
                    timeout=self.timeout_seconds,
                )
                text = (response.text or "").strip()
                if not text:
                    raise LLMServiceError("Gemini returned an empty response.")
                return text
            except asyncio.TimeoutError as exc:
                last_error = exc
                logger.warning("Gemini timeout on attempt %s", attempt + 1)
                if attempt < self.max_retries:
                    await asyncio.sleep(min(2**attempt, 4))
            except Exception as exc:
                last_error = exc
                logger.warning("Gemini failure on attempt %s: %s", attempt + 1, exc)
                if attempt < self.max_retries:
                    await asyncio.sleep(min(2**attempt, 4))

        raise LLMServiceError(f"Gemini request failed after retries: {last_error}")


llm_service = LLMService()
