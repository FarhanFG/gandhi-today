import { randomUUID } from "node:crypto";
import { extractText, getDocumentProxy } from "unpdf";
import { chunkText } from "./chunk";
import { embedText } from "./embed";
import { readStore, writeStore } from "./store";
import type { RagChunk, RagDocument } from "./types";

const MAX_BYTES = 100 * 1024 * 1024;

export async function ingestPdf(file: File) {
  if (file.type && file.type !== "application/pdf") {
    throw new Error("Only PDF files can be added to the archive.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("PDF is too large. Use a file under 100 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(bytes);
  const extracted = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];

  const chunks: RagChunk[] = [];
  const documentId = randomUUID();
  const name = file.name.replace(/[/\\]/g, "-") || "document.pdf";

  pages.forEach((pageText, index) => {
    for (const piece of chunkText(pageText)) {
      chunks.push({
        id: randomUUID(),
        documentId,
        documentName: name,
        page: index + 1,
        text: piece,
        embedding: embedText(piece),
      });
    }
  });

  if (chunks.length === 0) {
    throw new Error("No extractable text was found in that PDF.");
  }

  const document: RagDocument = {
    id: documentId,
    name,
    pages: extracted.totalPages || pages.length,
    chunkCount: chunks.length,
    createdAt: new Date().toISOString(),
  };

  const store = readStore();
  store.documents.push(document);
  store.chunks.push(...chunks);
  writeStore(store);

  return document;
}

export function deleteDocument(id: string) {
  const store = readStore();
  const exists = store.documents.some((document) => document.id === id);
  if (!exists) return false;
  store.documents = store.documents.filter((document) => document.id !== id);
  store.chunks = store.chunks.filter((chunk) => chunk.documentId !== id);
  writeStore(store);
  return true;
}
