# What would Gandhi say today?

A Next.js chatbot wrapper around Groq that answers present-day questions as historically grounded reconstructions of Gandhi’s thought. The system prompt is loaded from `prompt.json`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep `GROQ_API_KEY` in `.env`.

## Archive admin

Open [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with password `Marco` (or `ADMIN_PASSWORD` if you set one). Upload PDFs to store them in the local vector database. When a chat question is answered by those sources, the model presents that material first.

## Host on Vercel

Set **`GROQ_API_KEY`** in the Vercel project: Settings → Environment Variables (Production and Preview). Do not commit `.env`.

`GROQ_MODEL` is optional. If you add it, use a real id such as `openai/gpt-oss-120b` — leaving it blank makes the Groq request fail.
