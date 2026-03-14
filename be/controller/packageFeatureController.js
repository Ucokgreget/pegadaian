import { prisma } from "../lib/prisma.js";

// GET features by packageId
export const getFeaturesByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const features = await prisma.packageFeature.findMany({
      where: { packageId: parseInt(packageId) },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(features);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch features" });
  }
};

// POST create feature
export const createFeature = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { featureText, isHighlighted = false, sortOrder = 0 } = req.body;

    if (!featureText?.trim()) {
      return res.status(400).json({ error: "featureText wajib diisi" });
    }

    const feature = await prisma.packageFeature.create({
      data: {
        packageId: parseInt(packageId),
        featureText: featureText.trim(),
        isHighlighted,
        sortOrder,
      },
    });

    return res.status(201).json(feature);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create feature" });
  }
};

// PUT update feature
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { featureText, isHighlighted, sortOrder } = req.body;

    const feature = await prisma.packageFeature.update({
      where: { id: parseInt(id) },
      data: {
        ...(featureText !== undefined && { featureText: featureText.trim() }),
        ...(isHighlighted !== undefined && { isHighlighted }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return res.json(feature);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Feature not found" });
    console.error(error);
    return res.status(500).json({ error: "Failed to update feature" });
  }
};

// DELETE feature
export const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.packageFeature.delete({ where: { id: parseInt(id) } });
    return res.json({ message: "Feature deleted" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Feature not found" });
    console.error(error);
    return res.status(500).json({ error: "Failed to delete feature" });
  }
};

// PATCH reorder — terima array [{ id, sortOrder }]
export const reorderFeatures = async (req, res) => {
  try {
    const { items } = req.body; // [{ id: 1, sortOrder: 0 }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items harus berupa array" });
    }

    await prisma.$transaction(
      items.map(({ id, sortOrder }) =>
        prisma.packageFeature.update({
          where: { id: parseInt(id) },
          data: { sortOrder: parseInt(sortOrder) },
        }),
      ),
    );

    return res.json({ message: "Reorder successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reorder features" });
  }
};

export const getPublicFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const features = await prisma.packageFeature.findMany({
      where: { packageId: parseInt(id) },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        featureText: true,
        isHighlighted: true,
        sortOrder: true,
      },
    });
    return res.json(features);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch features" });
  }
};
