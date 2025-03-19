import { Request, Response } from "express";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";

const productRepository = AppDataSource.getRepository(Product);
const productImageRepository = AppDataSource.getRepository(ProductImage);

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productRepository.find({
            relations: ["images"],
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await productRepository.findOne({
            where: { id: Number(id) },
            relations: ["images"],
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};
