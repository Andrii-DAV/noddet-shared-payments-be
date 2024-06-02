import { catchAsync } from '../utils/common';
import Account from '../models/accountModel';
import User from '../models/userModel';

export const getAccounts = catchAsync(async (req, res) => {
  const acc = await Account.find();

  res.status(200).json({
    status: 'success',
    data: acc,
  });
});

export const createAccount = catchAsync(async (req, res) => {
  const { name, type } = req.body;

  const acc = await Account.create({
    name,
    type,
    owner: req.user._id,
    users: [{ user: req.user._id }],
  });

  res.status(201).json({
    status: 'success',
    data: acc,
  });
});

export const getCurrentAccInfo = catchAsync(async (req, res) => {
  const acc = await Account.findById(req.params.id).select('-__v ');

  if (!acc) return res.status(404).json({ status: 'Not Found' });

  const stat = await (acc as any).getStatistics();

  (acc as any).users = acc.users.map((u) => ({
    ...u,
    debt: stat.usersDebts[u._id.toString()].debt,
  }));
  acc.total = stat.total;

  res.status(200).json({ data: acc });
});

export const inviteUser = catchAsync(async (req, res, next) => {
  const { email, account } = req.body;

  if (!email) {
    return next(new Error('Email is required!'));
  }

  const u = await User.find({ email });
  const acc = await Account.findById(account);

  if (!acc.owner._id.equals(req.user._id)) {
    return next(new Error('Not allowed to invite.'));
  }

  await acc.updateOne({
    $push: {
      users: {
        user: u[0],
      },
    },
  });

  res.status(200).json({
    status: 200,
    data: acc,
  });
});
