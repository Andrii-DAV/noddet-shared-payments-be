import { catchAsync } from '../utils/common';
import User from '../models/userModel';
import { getHeaderToken, jwtVerify, signToken } from '../utils/auth';
import { JwtPayload } from 'jsonwebtoken';

export const signUp = catchAsync(async (req, res, next) => {
  const { password, confirmPassword, email, first_name, last_name } = req.body;

  const user = await User.create({
    password,
    confirmPassword,
    email,
    first_name,
    last_name,
  });

  user.password = undefined;
  user.__v = undefined;

  res.status(201).json({
    status: 'success',
    user,
  });
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error('Please provide email and password.'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePasswords(user.password, password))) {
    return next(new Error('Incorrect email or password.'));
  }

  user.password = undefined;
  user.__v = undefined;

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    user,
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  const token = getHeaderToken(req);
  if (!token) {
    return next(new Error('Please log in to get access.'));
  }

  const { id } = (await jwtVerify(token, process.env.JWT_SECRET)) as JwtPayload;

  req.user = await User.findById(id);
  next();
});
