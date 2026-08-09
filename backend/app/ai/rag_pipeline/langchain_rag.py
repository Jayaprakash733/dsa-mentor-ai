from typing import List

from langchain_core.documents import Document

from app.ai.document_processor import document_processor
from app.ai.vector_store_manager import vector_store_manager
from app.ai.llm_client import llm_client

from app.ai.rag_pipeline.prompt_templates import (
    PromptTemplates,
    DifficultyLevel,
)

from app.ai.rag_pipeline.hint_generator import hint_generator


class RAGPipeline:
    """Handle document ingestion, retrieval and AI responses."""

    def ingest_file(self, file_path: str) -> int:
        """
        Load, split and store a document in ChromaDB.
        """

        chunks = document_processor.process_document(file_path)

        if not chunks:
            return 0

        vector_store_manager.add_documents(chunks)

        return len(chunks)

    def retrieve(
        self,
        query: str,
        k: int = 3,
    ) -> List[Document]:
        """
        Retrieve the most relevant document chunks.
        """

        return vector_store_manager.similarity_search(
            query=query,
            k=k,
        )

    def ask(
        self,
        query: str,
        difficulty: str = "Medium",
        k: int = 3,
        problem: str = "",
        conversation_history: str = "",
        phase: str = "understanding",
    ) -> str:
        """
        Retrieve relevant context and generate
        a phase-aware conversational response.
        """

        # ---------------------------------------------
        # 1. Use actual problem for RAG retrieval
        # ---------------------------------------------

        retrieval_query = f"""
Problem:
{problem}

Current student message:
{query}
"""

        documents = self.retrieve(
            retrieval_query,
            k,
        )

        # ---------------------------------------------
        # 2. Build retrieved context
        # ---------------------------------------------

        if documents:

            context = "\n\n".join(
                document.page_content
                for document in documents
            )

        else:

            context = "No relevant context was found."

        # ---------------------------------------------
        # 3. Validate difficulty
        # ---------------------------------------------

        try:

            difficulty_level = DifficultyLevel(
                difficulty
            )

        except ValueError:

            difficulty_level = DifficultyLevel.MEDIUM

        # ---------------------------------------------
        # 4. Build conversation-aware query
        # ---------------------------------------------

        full_query = f"""
Current Problem:
{problem}

Conversation Phase:
{phase}

Previous Conversation:
{conversation_history}

Current Student Message:
{query}

Important:
Continue the existing conversation.
Do not start a completely unrelated problem.
Use the previous conversation to understand
what the student already knows and where they
are currently stuck.

Stay within the current conversation phase.
"""

        # ---------------------------------------------
        # 5. Generate phase-aware prompt
        # ---------------------------------------------

        prompt = PromptTemplates.get_initial_explanation(
            difficulty=difficulty_level,
            query=full_query,
            context=context,
            phase=phase,
        )

        return llm_client.generate(prompt)

    def get_hint(
        self,
        query: str,
        topic: str,
        hint_level: int,
        k: int = 3,
        problem: str = "",
        conversation_history: str = "",
    ) -> str:
        """
        Retrieve context and generate a progressive hint.
        """

        # ---------------------------------------------
        # 1. Use actual problem for hint retrieval
        # ---------------------------------------------

        retrieval_query = f"""
Problem:
{problem}

Current student message:
{query}
"""

        documents = self.retrieve(
            retrieval_query,
            k,
        )

        # ---------------------------------------------
        # 2. Build problem context
        # ---------------------------------------------

        if documents:

            problem_context = "\n\n".join(
                document.page_content
                for document in documents
            )

        else:

            problem_context = problem or query

        # ---------------------------------------------
        # 3. Generate hint content
        # ---------------------------------------------

        hint_content = hint_generator.get_hint(
            level=hint_level,
            topic=topic,
            problem_context=problem_context,
        )

        # ---------------------------------------------
        # 4. Include conversation history
        # ---------------------------------------------

        full_context = f"""
Problem:
{problem}

Previous Conversation:
{conversation_history}

Current Student Message:
{query}

Relevant Problem Context:
{problem_context}
"""

        # ---------------------------------------------
        # 5. Generate hint prompt
        # ---------------------------------------------

        prompt = PromptTemplates.get_hint(
            hint_level=hint_level,
            problem_context=full_context,
            hint_content=hint_content,
        )

        return llm_client.generate(prompt)


rag_pipeline = RAGPipeline()