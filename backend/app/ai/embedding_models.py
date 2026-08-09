from typing import List

from langchain_huggingface import HuggingFaceEmbeddings


class EmbeddingManager:
    """Manage the embedding model used by the RAG pipeline."""

    _instance = None
    _embeddings = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._embeddings is None:
            self._load_embeddings()

    def _load_embeddings(self):
        self._embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    def get_embeddings(self):
        return self._embeddings

    def embed_query(self, query: str) -> List[float]:
        return self._embeddings.embed_query(query)

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        return self._embeddings.embed_documents(documents)


embedding_manager = EmbeddingManager()