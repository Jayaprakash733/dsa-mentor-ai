from typing import List, Optional, Dict, Any

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.ai.embedding_models import embedding_manager


class VectorStoreManager:
    """Manage ChromaDB vector store operations."""

    def __init__(
        self,
        collection_name: str = "dsa_documents",
        chroma_host: str = "localhost",
        chroma_port: int = 8001,
    ):
        self.collection_name = collection_name
        self.embeddings = embedding_manager.get_embeddings()

        self.client = chromadb.HttpClient(
            host=chroma_host,
            port=chroma_port,
        )

        self.vector_store = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
        )

    def add_documents(
        self,
        documents: List[Document],
        metadata: Optional[Dict[str, Any]] = None,
    ):
        if metadata:
            for document in documents:
                document.metadata.update(metadata)

        return self.vector_store.add_documents(documents)

    def similarity_search(
        self,
        query: str,
        k: int = 5,
    ) -> List[Document]:
        return self.vector_store.similarity_search(
            query=query,
            k=k,
        )

    def similarity_search_with_score(
        self,
        query: str,
        k: int = 5,
    ):
        return self.vector_store.similarity_search_with_score(
            query=query,
            k=k,
        )

    def get_retriever(
        self,
        search_type: str = "similarity",
        k: int = 5,
    ):
        if search_type == "mmr":
            return self.vector_store.as_retriever(
                search_type="mmr",
                search_kwargs={
                    "k": k,
                    "fetch_k": k * 2,
                },
            )

        return self.vector_store.as_retriever(
            search_kwargs={"k": k}
        )

    def delete_documents(self, ids: List[str]) -> None:
        self.vector_store.delete(ids=ids)

    def get_vectorstore(self):
        return self.vector_store


vector_store_manager = VectorStoreManager()