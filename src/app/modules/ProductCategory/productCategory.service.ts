import mongoose, { Types } from 'mongoose';
import ProductCategory from './productCategory.model';
import { TProductCategory } from './productCategory.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../User/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { searchableFields } from './productCategory.const';

const createProductCategory = async (
  payload: TProductCategory,
  userData: JwtPayload,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({
      userId: userData.userId,
    }).session(session);
    if (!existingUser) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
    }
    // Check duplicate category
    const isExist = await ProductCategory.findOne({
      categoryName: payload.categoryName,
    }).session(session);

    if (isExist) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Category already exists');
    }

    // ✅ Attach createdBy (IMPORTANT FIX)
    const categoryData = {
      ...payload,
      createdBy: existingUser._id,
    };

    // ✅ Create category
    const newCategory = await ProductCategory.create([categoryData], {
      session,
    });

    await session.commitTransaction();

    return newCategory[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Get All Categories
const getAllProductCategoriesFromDB = async (
  query: Record<string, unknown>,
) => {
  const productCategoryQuery = new QueryBuilder(ProductCategory.find(), query)
    .sort()
    .paginate()
    .search(searchableFields)
    .filter();

  const meta = await productCategoryQuery.countTotal();
  const data = await productCategoryQuery.modelQuery;

  return {
    meta,
    data,
  };
};

// ✅ Get Single Category
const getSingleCategoryFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid category ID');
  }

  const result = await ProductCategory.findById(id).populate(
    'createdBy',
    'fullName email',
  );

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  return result;
};

// ✅ Update Category
const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<TProductCategory>,
  userInfo: JwtPayload,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({
      userId: userInfo.userId,
    }).session(session);
    if (!existingUser) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid category ID');
    }

    // Check duplicate name
    if (payload.categoryName) {
      const isExist = await ProductCategory.findOne({
        categoryName: payload.categoryName,
        _id: { $ne: id },
      }).session(session);

      if (isExist) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'Category name already exists',
        );
      }
    }

    const updated = await ProductCategory.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updated) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }

    await session.commitTransaction();

    return updated;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Delete Category
const deleteCategoryFromDB = async (id: string, userInfo: JwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({
      userId: userInfo.userId,
    }).session(session);
    if (!existingUser) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid category ID');
    }

    const deleted = await ProductCategory.findByIdAndDelete(id, {
      session,
    });

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }

    await session.commitTransaction();

    return deleted;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const ProductCategoryService = {
  createProductCategory,
  getAllProductCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
