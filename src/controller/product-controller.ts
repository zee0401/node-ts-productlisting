import { Request, Response } from "express";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";
import path from "path";
import fs from "fs";

const productRepository = AppDataSource.getRepository(Product);
const productImageRepository = AppDataSource.getRepository(ProductImage);

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find({ relations: ["images"] });

        res.status(200).json({
            message: "Products fetched successfully",
            products,
        });
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

        res.status(200).json({ message: " Product fetched ", product });
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

    console.log(req.body, "req.body");

    try {
        if (!sku || !name || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const product = new Product();
        product.sku = sku;
        product.name = name;
        product.price = parseInt(price);

        const savedProduct = await productRepository.save(product);

        if (!savedProduct) {
            throw new Error("Error saving product");
        }

        if (files && files.length > 0) {
            try {
                const productImages = files.map((file) => {
                    const img = new ProductImage();
                    img.url = `/uploads/${file.filename}`;
                    img.product = savedProduct;
                    return img;
                });

                await productImageRepository.save(productImages);
            } catch (imageError) {
                console.error(
                    "Error saving images, deleting uploaded files..."
                );
                files.forEach((file) => {
                    const filePath = path.join(
                        __dirname,
                        "../uploads",
                        file.filename
                    );

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                throw new Error("Error saving product images");
            }
        }

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Create Product Error:", error);

        if (files && files.length > 0) {
            files.forEach((file) => {
                const filePath = path.join(
                    __dirname,
                    "../uploads",
                    file.filename
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: "Error creating product",
            error: errorMessage,
        });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { id } = req.params;
    const { sku, name, price, imageIdsToDelete } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    try {
        const product = await productRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["images"],
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (sku) product.sku = sku;
        if (name) product.name = name;
        if (price) product.price = parseFloat(price);

        if (imageIdsToDelete && Array.isArray(imageIdsToDelete)) {
            for (const imageId of imageIdsToDelete) {
                const image = await productImageRepository.findOne({
                    where: { id: imageId },
                });

                if (image) {
                    const filePath = path.join(
                        __dirname,
                        "../../uploads",
                        path.basename(image.url)
                    );

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    await productImageRepository.delete(image.id);
                }
            }

            product.images = product.images.filter(
                (img) => !imageIdsToDelete.includes(img.id)
            );
        }

        if (files.length > 0) {
            const newImages = files.map((file) => {
                const img = new ProductImage();
                img.url = `/uploads/${file.filename}`;
                img.product = product;
                return img;
            });

            await productImageRepository.save(newImages);
            product.images = [...product.images, ...newImages];
        }

        await productRepository.save(product);

        const productResponse = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            images: product.images.map((img) => ({
                id: img.id,
                url: img.url,
            })),
        };

        return res.status(200).json({
            message: "Product updated successfully",
            product: productResponse,
        });
    } catch (error) {
        console.error("Update Product Error:", error);

        return res.status(500).json({
            message: "Error updating product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
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
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.images.length > 0) {
            for (const image of product.images) {
                const filePath = path.join(__dirname, "..", image.url);

                console.log("Attempting to delete:", filePath);

                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("Deleted file:", filePath);
                        }
                    });
                } else {
                    console.warn("File not found:", filePath);
                }
            }

            const imageIds = product.images.map((img) => img.id);
            await productImageRepository.delete(imageIds);
        }

        await productRepository.delete(product.id);

        return res.status(200).json({
            message: "Product and associated images deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);
        return res
            .status(500)
            .json({ message: "Error deleting product", error });
    }
};
