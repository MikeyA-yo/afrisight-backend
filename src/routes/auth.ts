import { Hono } from "hono";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { signJwt } from "../lib/jwt";

const auth = new Hono();

auth.post("/signup", async (c) => {
  const { email, password } = await c.req.json();
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashed });
    const token = await signJwt({ userId: user._id, email: user.email });
    return c.json({ token });
  } catch (e) {
    return c.json({ error: "Email already exists" }, 400);
  }
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const user = await User.findOne({ email });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);
  const token = await signJwt({ userId: user._id, email: user.email });
  return c.json({ token });
});

export default auth;