import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  return Response.json({ authenticated: await isAdminAuthenticated() });
}
