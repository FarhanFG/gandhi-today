const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 160;

export function chunkText(text: string) {
  const cleaned = text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + CHUNK_SIZE, cleaned.length);
    if (end < cleaned.length) {
      const slice = cleaned.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("? "),
      );
      if (breakAt > CHUNK_SIZE * 0.45) end = start + breakAt + 1;
    }

    const piece = cleaned.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= cleaned.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}
