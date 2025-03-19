import { Request, Response } from "express";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";
import path from "path";
import fs from "fs";

interface MulterRequest extends Request {
    files?: Express.Multer.File[];
}

const productRepository = AppDataSource.getRepository(Product);
const productImageRepository = AppDataSource.getRepository(ProductImage);

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find({ relations: ["images"] });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getProductById = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { id } = req.params;

    try {
        const product = await productRepository.findOne({
            where: { id: Number(id) },
            relations: ["images"],
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};

export const createProduct = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { sku, name, price } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        if (!sku || !name || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const product = new Product();
        product.sku = sku;
        product.name = name;
        product.price = parseFloat(price);

        const savedProduct = await productRepository.save(product);

        if (!savedProduct) {
            return res.status(500).json({ error: "Error saving product" });
        }

        if (files && files.length > 0) {
            const productImages = files.map((file) => {
                const img = new ProductImage();
                img.url = `/uploads/${file.filename}`;
                img.product = savedProduct;
                return img;
            });

            await productImageRepository.save(productImages);
        }

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { id } = req.params;
    const { sku, name, price, imageIdsToDelete } = req.body;
    const files = req.files || [];

    try {
        const product = await productRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["images"],
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        product.sku = sku || product.sku;
        product.name = name || product.name;
        product.price = price ? parseFloat(price) : product.price;

        if (imageIdsToDelete && Array.isArray(imageIdsToDelete)) {
            for (const imageId of imageIdsToDelete) {
                const image = await productImageRepository.findOne({
                    where: { id: imageId },
                });
                if (image) {
                    const filePath = path.join(
                        __dirname,
                        "../../uploads",
                        image.url
                    );
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    await productImageRepository.delete(image.id);
                }
            }
        }

        if (files && files.length) {
            const newImages = (files as Express.Multer.File[]).map((file) => {
                const img = new ProductImage();
                img.url = `/uploads/${file.filename}`;
                img.product = product;
                return img;
            });

            await productImageRepository.save(newImages);
            product.images = [...product.images, ...newImages];
        }

        const updatedProduct = await productRepository.save(product);

        if (!updatedProduct) {
            return res.status(500).json({ error: "Error updating product" });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { id } = req.params;

    try {
        const product = await productRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["images"],
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        if (product.images.length > 0) {
            for (const image of product.images) {
                const filePath = path.join(
                    __dirname,
                    "../../uploads",
                    image.url
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            const imageIds = product.images.map((img) => img.id);
            await productImageRepository.delete(imageIds);
        }

        await productRepository.delete(product.id);

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};
