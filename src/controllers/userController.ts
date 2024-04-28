import { catchAsync } from '../utils/common';
import User from '../models/userModel';
import Account, { IAccount } from '../models/accountModel';

export const userProfile = catchAsync(async (req, res, next) => {
  const {
    user: { _id },
  } = req;

  const user = await User.findById(_id);
  const accountsDB = await Account.find({ owner: user._id });
  const accounts = accountsDB.map(({ _id, name, type }) => ({
    _id,
    name,
    type,
  }));

  res.status(200).json({
    status: 'success',
    data: { user, accounts },
  });
});
