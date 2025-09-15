import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signJwt(payload: Record<string, unknown>) {
  return sign(payload, JWT_SECRET);
}

export function verifyJwt(token: string) {
  return verify(token, JWT_SECRET);
}