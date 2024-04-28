import { Request as MongooseRequest, Response, NextFunction } from 'express';
import { IUser } from '../models/userModel';

interface AdditionalRequestFields {
  user?: IUser;
}
export interface Request extends MongooseRequest, AdditionalRequestFields {}

type CatchAsyncCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | Promise<Response>;

export const catchAsync =
  (cb: CatchAsyncCallback) =>
  (req: Request, res: Response, next: NextFunction) =>
    cb(req, res, next).catch((e) => next(e));
