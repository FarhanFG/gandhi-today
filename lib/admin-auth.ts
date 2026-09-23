import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "gandhi_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "Marco";
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.GROQ_API_KEY ||
    "gandhi-admin-session"
  );
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string) {
  return safeEqual(password, adminPassword());
}

export function readAdminToken(token?: string) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!safeEqual(sign(payload), signature)) return false;
  const issued = Number(payload.split(".")[1]);
  if (!Number.isFinite(issued)) return false;
  return Date.now() - issued < MAX_AGE * 1000;
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return readAdminToken(jar.get(COOKIE)?.value);
}

export async function createAdminSession() {
  const payload = `ok.${Date.now()}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireAdmin() {
  if (await isAdminAuthenticated()) return null;
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}
