import { Request, Response } from "express";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entity/Product";
import { v2 as cloudinary } from "cloudinary";

const productImageRepository = AppDataSource.getRepository(ProductImage);
const productRepository = AppDataSource.getRepository(Product);

export const getAllProductImages = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const product = await productRepository.findOne({
            where: { id: Number(req.params.id) },
            relations: ["images"],
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        res.status(200).json(product.images);
    } catch (error) {
        console.error("Error fetching product images:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteProductImage = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId, imageId } = req.params;

    try {
        const productImage = await productImageRepository.findOne({
            where: { id: Number(imageId), product: { id: Number(productId) } },
        });

        if (!productImage) {
            res.status(404).json({ error: "Product image not found" });
            return;
        }

        const publicId = productImage.url.split("/").pop()?.split(".")[0];

        if (!publicId) {
            res.status(400).json({ error: "Invalid image URL" });
            return;
        }

        await cloudinary.uploader.destroy(publicId);

        await productImageRepository.delete(productImage.id);

        res.status(200).json({ message: "Product image deleted successfully" });
    } catch (error) {
        console.error("Error deleting product image:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
