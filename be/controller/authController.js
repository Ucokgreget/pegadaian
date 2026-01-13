import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, name: true },
    });

    if (!user)
      return res.status(401).json({ error: "Email atau password salah" });

    const ok = bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ error: "Email atau password salah" });

    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        subject: String(user.id),
      }
    );

    return res.status(200).json({ message: "Login berhasil", token, user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "gagal login wak", details: error?.message });
  }
};

//register
export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email udah ada" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hash, name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res
      .status(201)
      .json({ message: "User telah dibuat", user: newUser });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "gagal register wak", details: error?.message });
  }
};

//logout
export const logout = async (req, res) => {
  // Since this is a stateless API, logout can be handled on the client side
  res.status(200).json({ message: "Logout successful" });
};

// getMe
export const getMe = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
