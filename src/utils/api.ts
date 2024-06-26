import { FilterQuery, Query as MongooseQuery } from 'mongoose';
import { Query as ExpressCoreQuery } from 'express-serve-static-core';

// eslint-disable-next-line
type Query = MongooseQuery<any, any>;
type Filters = FilterQuery<unknown>;

export class APIQueryParams {
  public query: Query;
  private readonly querySort: string;
  private readonly queryPage: string;
  private readonly queryLimit: string;
  private readonly fields: string;
  private readonly filters: Filters;

  constructor(query: Query, queryString: ExpressCoreQuery) {
    this.query = query;
    const mongodbFriendlyQuery = JSON.parse(
      JSON.stringify(queryString).replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matched) => `$${matched}`,
      ),
    );

    const {
      sort: querySort,
      page: queryPage,
      limit: queryLimit,
      fields,
      ...filters
    } = mongodbFriendlyQuery;

    this.querySort = querySort;
    this.queryPage = queryPage;
    this.filters = filters;
    this.queryLimit = queryLimit;
    this.fields = fields;
  }

  filter() {
    this.query.find(this.filters);
    return this;
  }
  sort() {
    if (this.querySort) {
      this.query = this.query.sort(this.querySort.split(',').join(' '));
    }
    return this;
  }
  limitFields() {
    if (this.fields) {
      this.query = this.query.select(this.fields.split(',').join(' '));
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = Number(this.queryPage) || 1;
    const limit = Number(this.queryLimit) || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
