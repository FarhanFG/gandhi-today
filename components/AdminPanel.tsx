"use client";

import { FormEvent, useEffect, useState } from "react";
import type { RagDocument } from "@/lib/rag/types";

export function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function loadDocuments() {
    const response = await fetch("/api/admin/documents");
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (!response.ok) throw new Error("Could not load the archive.");
    const payload = (await response.json()) as { documents: RagDocument[] };
    setDocuments(payload.documents);
    setAuthenticated(true);
  }

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) => {
        if (!payload.authenticated) {
          setAuthenticated(false);
          return;
        }
        return loadDocuments();
      })
      .catch(() => setError("Could not check the admin session."))
      .finally(() => setChecking(false));
  }, []);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Wrong password.");
        return;
      }
      setPassword("");
      await loadDocuments();
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setDocuments([]);
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        error?: string;
        document?: RagDocument;
      };
      if (!response.ok) {
        setError(payload.error || "Upload failed.");
        return;
      }
      setStatus(
        payload.document
          ? `${payload.document.name} stored as ${payload.document.chunkCount} searchable pieces.`
          : "PDF stored in the archive.",
      );
      await loadDocuments();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Could not remove that PDF.");
        return;
      }
      await loadDocuments();
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <p className="font-ui text-sm text-ink-soft">Checking archive access…</p>
    );
  }

  if (!authenticated) {
    return (
      <form onSubmit={onLogin} className="mx-auto w-full max-w-sm space-y-4">
        <div>
          <p className="font-ui text-[11px] tracking-[0.22em] text-earth uppercase">
            Restricted
          </p>
          <h2 className="font-display mt-1 text-3xl italic">Archive login</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Enter the admin password to upload PDFs into the searchable archive.
          </p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-earth/15 bg-khadi/60 px-4 py-3 text-[15px] outline-none focus:border-saffron/50"
        />
        {error ? <p className="text-sm text-saffron-deep">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !password}
          className="rounded-full bg-saffron px-5 py-2.5 text-sm text-paper disabled:opacity-40"
        >
          {busy ? "Opening…" : "Enter"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-ui text-[11px] tracking-[0.22em] text-earth uppercase">
            Vector archive
          </p>
          <h2 className="font-display mt-1 text-3xl italic">PDF sources</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Uploaded PDFs are split, embedded, and stored in the local vector
            database. The chatbot uses them first when they answer the question.
            Locally this is saved under data/. On a serverless host it lasts
            only for the running instance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="font-ui rounded-full border border-earth/20 px-3 py-1.5 text-xs text-earth"
        >
          Sign out
        </button>
      </div>

      <label className="paper-card flex cursor-pointer flex-col items-center rounded-[24px] border border-dashed border-earth/25 px-6 py-10 text-center">
        <span className="font-display text-2xl italic">Drop a PDF here</span>
        <span className="mt-2 text-sm text-ink-soft">
          or click to choose a file up to 100 MB. Text is extracted and indexed
          immediately.
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onUpload(file);
          }}
        />
      </label>

      {busy ? (
        <p className="text-sm italic text-ink-soft">Working on the archive…</p>
      ) : null}
      {status ? <p className="text-sm text-ashram">{status}</p> : null}
      {error ? <p className="text-sm text-saffron-deep">{error}</p> : null}

      <div>
        <p className="font-ui mb-3 text-[11px] tracking-[0.22em] text-earth uppercase">
          Stored documents
        </p>
        {documents.length === 0 ? (
          <p className="text-sm text-ink-soft">No PDFs in the archive yet.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-earth/10 bg-khadi/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-ink">{document.name}</p>
                  <p className="font-ui text-[11px] text-ink-soft">
                    {document.pages} pages · {document.chunkCount} vectors ·{" "}
                    {new Date(document.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(document.id)}
                  className="font-ui text-xs text-saffron-deep"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
