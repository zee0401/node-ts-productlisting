import { Router } from "express";
import { deleteProductImage } from "../controller/productImage-controller";

const router = Router();

router.delete("/:productId/images/:imageId", deleteProductImage);

export default router;
