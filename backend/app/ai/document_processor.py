from pathlib import Path
from typing import List, Dict, Any, Optional

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    CSVLoader,
)
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class DocumentProcessor:
    """Load and split documents for the RAG pipeline."""

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def load_pdf(self, file_path: str) -> List[Document]:
        loader = PyPDFLoader(file_path)
        return loader.load()

    def load_text(self, file_path: str) -> List[Document]:
        loader = TextLoader(file_path, encoding="utf-8")
        return loader.load()

    def load_csv(self, file_path: str) -> List[Document]:
        loader = CSVLoader(file_path)
        return loader.load()

    def load_file(self, file_path: str) -> List[Document]:
        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return self.load_pdf(file_path)

        if extension in {".txt", ".md"}:
            return self.load_text(file_path)

        if extension == ".csv":
            return self.load_csv(file_path)

        raise ValueError(
            f"Unsupported file format: {extension}"
        )

    def split_documents(
        self,
        documents: List[Document],
    ) -> List[Document]:
        return self.text_splitter.split_documents(documents)

    def process_document(
        self,
        file_path: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Document]:

        documents = self.load_file(file_path)

        if metadata:
            for document in documents:
                document.metadata.update(metadata)

        return self.split_documents(documents)

    def process_text(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Document]:

        document = Document(
            page_content=text,
            metadata=metadata or {},
        )

        return self.split_documents([document])


document_processor = DocumentProcessor(
    chunk_size=1000,
    chunk_overlap=200,
)