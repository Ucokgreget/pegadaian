import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const accessToken = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m", subject: String(user.id) },
    );

    const refreshToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d", subject: String(user.id) },
    );

    let rememberToken = null;
    if (rememberMe) {
      rememberToken = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d", subject: String(user.id) },
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { rememberToken },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, accessToken },
    });

    return res.status(200).json({
      message: "Login berhasil",
      accessToken,
      refreshToken,
      rememberToken,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Gagal login", details: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.sub) },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User tidak ditemukan" });
    }

    const newAccessToken = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m", subject: String(user.id) },
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: "Refresh token tidak valid" });
  }
};

export const loginWithRememberMe = async (req, res) => {
  const { rememberToken } = req.body;

  if (!rememberToken) {
    return res.status(401).json({ error: "Remember token tidak ditemukan" });
  }

  try {
    // Cari user berdasarkan rememberToken di database
    const user = await prisma.user.findFirst({
      where: { rememberToken },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        rememberToken: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Remember token tidak valid" });
    }

    // Verifikasi token JWT juga valid (belum expire)
    jwt.verify(rememberToken, process.env.JWT_SECRET);

    // Buat accessToken baru
    const accessToken = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m", subject: String(user.id) },
    );

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    // JWT expired → hapus rememberToken dari DB
    await prisma.user.updateMany({
      where: { rememberToken },
      data: { rememberToken: null },
    });
    return res.status(401).json({ error: "Remember token expired" });
  }
};

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

export const logout = async (req, res) => {
  if (req.user) {
    await prisma.user.update({
      where: { id: parseInt(req.user.id) },
      data: { rememberToken: null },
    });
  }
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (req, res) => {
  try {
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
