import { prisma } from "../lib/prisma.js";

export const getProductVariants = async (req, res) => {
    const userId = parseInt(req.user?.id);
    if (!userId) {
        return res.status(401).json("Unauthorized");
    }

    try {
        const variants = await prisma.productVariant.findMany({
            where: { product: { userId: userId } },
            orderBy: { createdAt: "desc" }
        })
        return res.json(variants);
    } catch (error) {
        console.error(error);
        return res.status(500).json("Failed to fetch product variants");
    }
}

export const getProductVariantById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user?.id);
        if (!userId) {
            return res.status(401).json("Unauthorized");
        }

        const variant = await prisma.productVariant.findFirst({
            where: {
                id: parseInt(id),
                product: { userId: userId }
            }
        })
        if (!variant) {
            return res.status(404).json("Product variant not found");
        }
        return res.json(variant);
    } catch (error) {
        console.error(error);
        return res.status(500).json("Failed to fetch product variant");
    }
}

export const createProductVariant = async (req, res) => {
    try {
        const userId = parseInt(req.user?.id);
        const { name, price, stock, description, productId } = req.body;

        if (!name || price === undefined || !productId) {
            return res.status(400).json("Name, price, and product ID are required");
        }

        const existingProduct = await prisma.productVariant.findFirst({
            where: {
                name,
                product: { userId: userId },
                productId: parseInt(productId)
            }
        })
        if (existingProduct) {
            return res.status(409).json("Product variant already exists");
        }

        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = req.file.path.replace(/\\/g, "/");
        }

        const variant = await prisma.productVariant.create({
            data: {
                name,
                price: parseInt(price),
                stock: parseInt(stock) || 0,
                description,
                imageUrl,
                productId: parseInt(productId)
            }
        })
        return res.status(201).json(variant);
    } catch (error) {
        console.error(error);
        return res.status(500).json("Failed to create product variant");
    }
}

export const updateProductVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user?.id);
        const { name, price, stock, description, productId } = req.body;

        if (!name || price === undefined || !productId) {
            return res.status(400).json("Name, price, and product ID are required");
        }

        const existingProduct = await prisma.productVariant.findFirst({
            where: {
                id: parseInt(id),
                product: { userId: userId },
                productId: parseInt(productId)
            }
        })
        if (!existingProduct) {
            return res.status(404).json("Product variant not found");
        }

        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = req.file.path.replace(/\\/g, "/");
        }

        const updatedProduct = await prisma.productVariant.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseInt(price),
                stock: parseInt(stock) || 0,
                description,
                imageUrl,
                productId: parseInt(productId)
            }
        })
        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json("Failed to update product variant");
    }
}

export const deleteProductVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user?.id);

        const existingProduct = await prisma.productVariant.findFirst({
            where: {
                id: parseInt(id),
                product: { userId: userId },
            }
        })
        if (!existingProduct) {
            return res.status(404).json("Product variant not found");
        }

        await prisma.productVariant.delete({
            where: { id: parseInt(id), }
        })
        return res.json("Product variant deleted successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).json("Failed to delete product variant");
    }
}