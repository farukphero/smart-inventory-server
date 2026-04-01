import mongoose, { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { TProduct } from "./products.interface";
import { User } from "../User/user.model";
import Product from "./products.model";
import ProductCategory from "../ProductCategory/productCategory.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { searchableFields } from "./products.constant";



  const createProductIntoDB = async (payload: TProduct, userData: JwtPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ Check user
      const user = await User.findOne({ userId: userData.userId }).session(session);
      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not found");
      }

      // ✅ Check category
      const category = await ProductCategory.findById(payload.categoryId).session(session);
      if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
      }

      // ✅ Auto status logic
      const status =
        payload.stockQuantity <= 0 ? "OUT_OF_STOCK" : "ACTIVE";

      const productData = {
        ...payload,
        status,
        createdBy: user._id,
      };

      const newProduct = await Product.create([productData], { session });

      await session.commitTransaction();

      return newProduct[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ✅ Get All Products (with pagination ready)

  const getAllProductsFromDB = async (query: Record<string, unknown>) => {
    const productCategoryQuery = new QueryBuilder(Product.find(), query)
    .sort()
    .paginate()
    .search(searchableFields)
    .filter()


  const meta = await productCategoryQuery.countTotal();
  const data = await productCategoryQuery.modelQuery.populate('categoryId').exec(); // <-- important to execute the query here
  return {
    meta,
    data,
  };
};


const getSingleProductFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product ID");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  }

  return product;
};

  // ✅ Update Product
  const updateProductIntoDB = async (id: string, payload: Partial<TProduct>) => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product ID");
    }

    if (payload.stockQuantity !== undefined) {
      payload.status =
        payload.stockQuantity <= 0 ? "OUT_OF_STOCK" : "ACTIVE";
    }

    const updated = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    return updated;
  }

  // ✅ Delete
  const deleteProductFromDB = async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product ID");
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    return deleted;
  }


  export const productService = {
    createProductIntoDB,
    getAllProductsFromDB,
    getSingleProductFromDB,
    updateProductIntoDB,
    deleteProductFromDB,
  };
