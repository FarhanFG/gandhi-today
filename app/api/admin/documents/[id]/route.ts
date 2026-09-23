import { requireAdmin } from "@/lib/admin-auth";
import { deleteDocument } from "@/lib/rag/ingest";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  if (!deleteDocument(id)) {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
