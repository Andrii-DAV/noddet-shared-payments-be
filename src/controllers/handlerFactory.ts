import mongoose from 'mongoose';
import { catchAsync } from '../utils/common';
import { APIQueryParams } from '../utils/api';

type Model = typeof mongoose.Model;
type PopulateOptions =
  | mongoose.PopulateOptions
  | mongoose.PopulateOptions[]
  | string[]
  | string;

export const getAll = (model: Model, countTotal?: boolean) =>
  catchAsync(async (req, res) => {
    const filter = { ...req.params };
    const features = new APIQueryParams(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields();

    let total = 0;
    if (countTotal) {
      total = (await features.query.clone()).length;
    }
    const documents = await features.paginate().query;

    const base = {
      status: 'success',
      data: documents,
    };

    res.status(200).json(
      countTotal
        ? {
            total,
            ...base,
          }
        : base,
    );
  });

export const deleteOne = (model: Model) =>
  catchAsync(async (req, res, next) => {
    const document = await model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new Error('No document found with that ID'));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (model: Model) =>
  catchAsync(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new Error('No document found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: document,
    });
  });

export const createOne = (model: Model) =>
  catchAsync(async (req, res) => {
    const document = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: document,
    });
  });

export const getOne = (model: Model, populateOptions?: PopulateOptions) =>
  catchAsync(async (req, res, next) => {
    let documentQuery = model.findById(req.params.id);

    if (populateOptions) {
      documentQuery = await documentQuery.populate('reviews');
    }

    const document = await documentQuery;

    if (!document) {
      return next(new Error('No document found with that ID'));
    }

    res.status(200).send({
      status: 'success',
      data: document,
    });
  });
