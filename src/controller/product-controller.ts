import { Request, Response } from "express";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";

interface MulterRequest extends Request {
    files?: Express.Multer.File[];
}

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

export const createProduct = async (req: MulterRequest, res: Response) => {
    const { sku, name, price } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        if (!sku || !name || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const product = new Product();
        product.sku = sku;
        product.name = name;
        product.price = price;

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
