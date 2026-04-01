/* eslint-disable @typescript-eslint/no-explicit-any */

// import { match } from "assert";
import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Fields to exclude
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Helper: parse string/array to clean array of non-empty values
    const parseToArray = (value: any): string[] => {
      if (!value) return [];
      let arr: string[] = [];

      if (typeof value === 'string') {
        try {
          arr = JSON.parse(value);
        } catch {
          arr = value.split(',').map((v: string) => v.trim());
        }
      } else if (Array.isArray(value)) {
        arr = value.map((v) => v.toString().trim());
      }

      return arr.filter((v) => v && v.length > 0);
    };

    // Handle price range
    if (this.query.price) {
      let priceRange: number[] = [];

      if (typeof this.query.price === 'string') {
        try {
          priceRange = JSON.parse(this.query.price);
        } catch {
          priceRange = this.query.price
            .split(',')
            .map((v: string) => Number(v));
        }
      } else if (Array.isArray(this.query.price)) {
        priceRange = this.query.price.map((v: any) => Number(v));
      }

      if (priceRange.length === 2) {
        (queryObj as any).price = {
          $gte: Number(priceRange[0]),
          $lte: Number(priceRange[1]),
        };
      }
    }

    // Handle filters with array values
    const arrayFilters = ['category', 'subCategory', 'district'];
    arrayFilters.forEach((key) => {
      const values = parseToArray(this.query[key]);
      if (values.length > 0) {
        (queryObj as any)[`${key}.value`] = { $in: values };
      }
      delete (queryObj as any)[key];
    });

    // 🟢 user filter
    if (this.query.id && typeof this.query.id === 'string') {
      (queryObj as any).user = this.query.id;
      delete (queryObj as any).id; // <-- important
    }
    // 🟢 user filter
    if (this.query.adsId && typeof this.query.adsId === 'string') {
      (queryObj as any)._id = this.query.adsId;
      delete (queryObj as any).adsId; // <-- important
    }

    // Apply query
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
