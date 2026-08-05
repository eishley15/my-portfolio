import jwt from "jsonwebtoken";

export function requireStudio(req, res) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return null; }

  try {
    const payload = jwt.verify(token, process.env.STUDIO_TOKEN_SECRET);
    if (payload.role !== "studio") { res.status(401).json({ error: "Unauthorized" }); return null; }
    return payload;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}
