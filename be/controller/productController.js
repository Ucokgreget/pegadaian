import { prisma } from "../lib/prisma.js";

// GET All Products
export const getProducts = async (req, res) => {
    try {
        const userId = parseInt(req.user?.id || "0");
        if(!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const products = await prisma.product.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch products" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user?.id || "0");
        const product = await prisma.product.findFirst({
            where: {
                id: parseInt(id),
                userId,
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const userId = parseInt(req.user?.id || "0");
        const { name, price, stock, description, imageUrl} = req.body;
        if (!name || !price ) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                userId,
            },
        });
        if (existingProduct) {
            return res.status(409).json({ error: "Product already exists" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                price:parseInt(price),
                stock:parseInt(stock) || 0,
                description,
                imageUrl,
                userId,
            },
        });
        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({ error: "Failed to create product" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = parseInt(req.user?.id || "0");
        const { name, price, stock, description, imageUrl } = req.body;

        if(!name || !price) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        const existingProduct = await prisma.product.findFirst({
            where: {
                id: parseInt(id),
                userId,
            },
        });
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price:parseInt(price),
                stock:parseInt(stock) || 0,
                description,
                imageUrl,
            },
        });
        return res.json(updatedProduct); 
    } catch (error) {
        return res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = parseInt(req.user?.id || "0");

        const existingProduct = await prisma.product.findFirst({
            where: {
                id: parseInt(id),
                userId,
            },
        });
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete product" });
    }
};
