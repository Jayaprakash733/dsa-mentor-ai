import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()


class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")

        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel("gemini-3.6-flash")

    def generate(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        return response.text


llm_client = LLMClient()