import { Router } from "express";
import {
    deleteProductImage,
    getAllProductImages,
} from "../controller/productImage-controller";

const router = Router();

router.delete("/:productId/images/:imageId", deleteProductImage);

export default router;
