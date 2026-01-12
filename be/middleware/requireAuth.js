import jwt from "jsonwebtoken";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.email) return res.status(401).json({ error: "Unauthorized" });
    req.user = { email: payload.email, id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export default requireAuth;
