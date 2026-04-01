import { Request, Response } from 'express';
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import  httpStatus  from 'http-status';
import { ProductCategoryService } from "./productCategory.service";


const createProductCategory =catchAsync(async (req, res) => {
  const result = await ProductCategoryService.createProductCategory(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product category created successfully',
    data: result,
  });
});

const getAllProductCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductCategoryService.getAllProductCategoriesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product categories retrieved successfully',
    data: result,
  });
});


const getSingleCategoryFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductCategoryService.getSingleCategoryFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product category retrieved successfully',
    data: result,
  });
});

const updateCategoryIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductCategoryService.updateCategoryIntoDB(req.params.id, req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product category updated successfully',
    data: result,
  });
});


const deleteCategoryFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductCategoryService.deleteCategoryFromDB(req.params.id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product category deleted successfully',
    data: result,
  });
});
export const ProductCategoryController = {
  createProductCategory,
  getAllProductCategories,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB
}
