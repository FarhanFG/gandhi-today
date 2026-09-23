import { createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const password =
    body && typeof body === "object"
      ? (body as { password?: unknown }).password
      : undefined;

  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  await createAdminSession();
  return Response.json({ ok: true });
}
