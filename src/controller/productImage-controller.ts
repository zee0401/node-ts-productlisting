import { Request, Response } from "express";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entity/Product";
import fs from "fs";
import path from "path";

const productImageRepository = AppDataSource.getRepository(ProductImage);
const productRepository = AppDataSource.getRepository(Product);

export const getAllProductImages = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const productImages: any = await productRepository.findOne({
            where: { id: Number(req.params.id) },
            relations: ["images"],
        });

        res.status(200).json(productImages);
    } catch (error) {
        console.error("Error fetching product images:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteProductImage = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { productId, imageId } = req.params;

    try {
        const productImage = await productImageRepository.findOne({
            where: { id: Number(imageId), product: { id: Number(productId) } },
        });

        if (!productImage) {
            return res.status(404).json({ error: "Product image not found" });
        }

        const filePath = path.join(__dirname, "../", productImage.url);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            await productImageRepository.delete(productImage.id);
        } else {
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).json({ message: "Product image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
