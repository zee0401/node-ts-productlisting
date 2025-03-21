import { Router } from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controller/product-controller";
import upload from "../middleware/upload";

const router = Router();

router.get("/all-products", getAllProducts);
router.get("/:id", getProductById);
router.post("/create", upload.array("images", 5), createProduct);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
