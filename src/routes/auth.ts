import { Hono } from "hono";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { signJwt } from "../lib/jwt";

const auth = new Hono();

// Valid creator types
const validCreatorTypes = ["Content Creator", "Musician", "Producer", "Event Planner", "Other"];

auth.post("/signup", async (c) => {
  const { email, password, name, creatorType } = await c.req.json();

  // Validate creatorType
  if (!validCreatorTypes.includes(creatorType)) {
    return c.json({ error: `Invalid creatorType. Must be one of: ${validCreatorTypes.join(", ")}` }, 400);
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashed, name, creatorType });
    const token = await signJwt({ userId: user._id, email: user.email, name: user.name, creatorType: user.creatorType });
    return c.json({ token });
  } catch (e) {
    if (e instanceof Error) {
      return c.json({ error: e.message }, 400);
    } else {
      return c.json({ error: "Error creating user" }, 400);
    }
  }
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const user = await User.findOne({ email });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);
  const token = await signJwt({ userId: user._id, email: user.email, name: user.name, creatorType: user.creatorType });
  return c.json({ token });
});

export default auth;