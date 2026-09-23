import { cosineSimilarity, embedText, lexicalOverlap } from "./embed";
import { readStore } from "./store";
import type { RetrievedChunk } from "./types";

const MIN_SCORE = 0.18;
const MAX_HITS = 5;

export function retrieveFromArchive(query: string): RetrievedChunk[] {
  const store = readStore();
  if (store.chunks.length === 0) return [];

  const queryVector = embedText(query);

  return store.chunks
    .map((chunk) => {
      const vectorScore = cosineSimilarity(queryVector, chunk.embedding);
      const lexicalScore = lexicalOverlap(query, chunk.text);
      return {
        documentName: chunk.documentName,
        page: chunk.page,
        text: chunk.text,
        score: vectorScore * 0.7 + lexicalScore * 0.3,
      };
    })
    .filter((hit) => hit.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HITS);
}

export function archiveSystemAddendum() {
  return `

ARCHIVE RULES:
The user question may include a reference object with excerpts from uploaded PDF documents.
If those excerpts contain information that answers the question, present that information clearly first. Name the source PDF. Do not invent details that are not in the excerpts.
If the excerpts are missing or do not answer the question, ignore them and follow the Gandhi reconstruction rules.
Never use the asterisk character anywhere in your response.`;
}
