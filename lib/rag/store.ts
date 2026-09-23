import {
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { RagDocument, RagStore } from "./types";

const EMPTY_STORE: RagStore = { documents: [], chunks: [] };

function resolveStoreDir() {
  if (process.env.RAG_DATA_DIR) return process.env.RAG_DATA_DIR;

  const local = join(process.cwd(), "data");
  try {
    mkdirSync(local, { recursive: true });
    accessSync(local, constants.W_OK);
    return local;
  } catch {
    const fallback = "/tmp/gandhi-rag";
    mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function storePath() {
  return join(resolveStoreDir(), "vector-store.json");
}

export function readStore(): RagStore {
  try {
    const parsed = JSON.parse(readFileSync(storePath(), "utf8")) as RagStore;
    if (!parsed || !Array.isArray(parsed.documents) || !Array.isArray(parsed.chunks)) {
      return { documents: [], chunks: [] };
    }
    return parsed;
  } catch {
    return { documents: [], chunks: [] };
  }
}

export function writeStore(store: RagStore) {
  mkdirSync(resolveStoreDir(), { recursive: true });
  writeFileSync(storePath(), JSON.stringify(store), "utf8");
}

export function listDocuments(): RagDocument[] {
  return readStore().documents.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resetStore() {
  writeStore(EMPTY_STORE);
}
