import express from "express";
import auth from "../../middlewares/auth";
import { productController } from "./products.controller";
import { USER_ROLE } from "../User/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import { productValidation } from "./products.validation";

const router = express.Router();

// 🔥 Create Product
router.post(
  "/create",
	auth(USER_ROLE.user,
	  USER_ROLE.admin),
	validateRequest(productValidation.createProductZodSchema),
  productController.createProduct
);

// 📦 Get All Products (pagination)
router.get("/get-all", auth(USER_ROLE.user,
	  USER_ROLE.admin), productController.getAllProducts);

router.route("/:id").get(
  auth(USER_ROLE.user,
	  USER_ROLE.admin),
  productController.getSingleProduct
).patch(
  auth(USER_ROLE.user,
	  USER_ROLE.admin),
  validateRequest(productValidation.updateProductZodSchema),
  productController.updateProduct
).delete(
  auth(USER_ROLE.user,
	  USER_ROLE.admin),
  productController.deleteProduct
);


export const ProductRoutes = router;
