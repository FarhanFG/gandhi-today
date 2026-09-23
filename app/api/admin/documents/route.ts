import { requireAdmin } from "@/lib/admin-auth";
import { ingestPdf } from "@/lib/rag/ingest";
import { listDocuments } from "@/lib/rag/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return Response.json({ documents: listDocuments() });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a PDF to upload." }, { status: 400 });
  }

  try {
    const document = await ingestPdf(file);
    return Response.json({ document });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The PDF could not be stored.";
    return Response.json({ error: message }, { status: 400 });
  }
}
