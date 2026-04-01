import express from 'express';
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "../User/user.controller";
import { UserValidation } from "../User/user.validation";
import { productCategoryValidation } from "./productCategory.validation";
import { ProductCategoryController } from "./productCategory.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

router.post(
  '/create',
    auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
  ),
  validateRequest(productCategoryValidation.productCategoryZodSchema),
  ProductCategoryController.createProductCategory,
);

router.get(
  '/get-all',
  auth(
	USER_ROLE.user,
	USER_ROLE.admin,
  ),
  ProductCategoryController.getAllProductCategories,
);


router.route('/:id').get(
  auth(
	USER_ROLE.user,
	USER_ROLE.admin,
  ),
  ProductCategoryController.getSingleCategoryFromDB,
).patch(
  auth(
	USER_ROLE.user,
	USER_ROLE.admin,
  ),
  validateRequest(productCategoryValidation.updateProductCategoryZodSchema),
  ProductCategoryController.updateCategoryIntoDB,
).delete(auth(
	USER_ROLE.user,
	USER_ROLE.admin,
  ),ProductCategoryController.deleteCategoryFromDB);


export const ProductCategoryRoutes = router;
