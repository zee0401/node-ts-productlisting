import { Request, Response } from "express";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import { AppDataSource } from "../config/data-source";
import { v2 as cloudinary } from "cloudinary";

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
): Promise<void> => {
    const { sku, name, price } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        if (!sku || !name || !price) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const product = new Product();
        product.sku = sku;
        product.name = name;
        product.price = parseFloat(price);

        const savedProduct = await productRepository.save(product);

        if (files && files.length > 0) {
            const productImages = files.map((file) => {
                console.log("Uploaded File:", file);

                const img = new ProductImage();
                img.url = (file as any).path || (file as any).secure_url || "";
                img.product = savedProduct;
                return img;
            });

            await productImageRepository.save(productImages);
        }

        const productWithImages = await productRepository.findOne({
            where: { id: savedProduct.id },
            relations: ["images"],
        });

        if (!productWithImages) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        const response = {
            id: productWithImages.id,
            sku: productWithImages.sku,
            name: productWithImages.name,
            price: productWithImages.price,
            images: productWithImages.images.map((img) => ({
                id: img.id,
                url: img.url,
            })),
        };

        res.status(201).json(response);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({
            message: "Error creating product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const { sku, name, price, imageIdsToDelete } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        const product = await productRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["images"],
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
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
                    const publicId = image.url.split("/").pop()?.split(".")[0];
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                    await productImageRepository.delete(image.id);
                }
            }
        }

        if (files && files.length > 0) {
            const newImages = files.map((file) => {
                const img = new ProductImage();
                img.url = file.path;
                img.product = product;
                return img;
            });

            console.log("New Images:", newImages);
            console.log(
                "New Images:",
                newImages.map((img) => img.url)
            );
            product.images = [...product.images, ...newImages];
            await productImageRepository.save(product.images);
        }
        const updatedProduct = await productRepository.save(product);

        const productWithImages = await productRepository.findOne({
            where: { id: updatedProduct.id },
            relations: ["images"],
        });

        if (!productWithImages) {
            res.status(404).json({ error: "Product not found after update" });
            return;
        }

        const response = {
            id: productWithImages.id,
            sku: productWithImages.sku,
            name: productWithImages.name,
            price: productWithImages.price,
            images: productWithImages.images.map((img) => ({
                id: img.id,
                url: img.url,
            })),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({
            message: "Error updating product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
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
            await Promise.all(
                product.images.map(async (image) => {
                    const publicId = image.url.split("/").pop()?.split(".")[0];
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                })
            );
        }

        await productRepository.delete(product.id);
        res.status(204).send();
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Error deleting product", error });
    }
};
