import { catchAsync } from '../utils/common';
import User from '../models/userModel';

export const userProfile = catchAsync(async (req, res, next) => {
  const {
    user: { _id },
  } = req;

  const user = await User.findById(_id).populate({
    path: 'accounts_owner',
    select: 'name type',
  });

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
