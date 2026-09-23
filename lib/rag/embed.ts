const VECTOR_SIZE = 384;

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function embedText(text: string) {
  const vector = new Array<number>(VECTOR_SIZE).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vector;

  const features = [...tokens];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    features.push(`${tokens[i]}_${tokens[i + 1]}`);
  }

  for (const feature of features) {
    const hashed = hashToken(feature);
    const index = hashed % VECTOR_SIZE;
    const sign = hashed % 2 === 0 ? 1 : -1;
    vector[index] += sign;
  }

  let norm = 0;
  for (const value of vector) norm += value * value;
  const scale = Math.sqrt(norm) || 1;
  return vector.map((value) => value / scale);
}

export function cosineSimilarity(left: number[], right: number[]) {
  const size = Math.min(left.length, right.length);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < size; i += 1) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }
  const denom = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denom === 0 ? 0 : dot / denom;
}

export function lexicalOverlap(query: string, passage: string) {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;
  const passageTokens = new Set(tokenize(passage));
  let hits = 0;
  for (const token of queryTokens) {
    if (passageTokens.has(token)) hits += 1;
  }
  return hits / queryTokens.size;
}
