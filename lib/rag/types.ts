export type RagDocument = {
  id: string;
  name: string;
  pages: number;
  chunkCount: number;
  createdAt: string;
};

export type RagChunk = {
  id: string;
  documentId: string;
  documentName: string;
  page: number;
  text: string;
  embedding: number[];
};

export type RagStore = {
  documents: RagDocument[];
  chunks: RagChunk[];
};

export type RetrievedChunk = {
  documentName: string;
  page: number;
  text: string;
  score: number;
};
