import { catchAsync } from '../utils/common';
import Payment from '../models/paymentModel';
import Account from '../models/accountModel';
import { deleteOne, getAll } from './handlerFactory';

export const getAllPayments = getAll(Payment);
export const deletePayment = deleteOne(Payment);

export const addPayment = catchAsync(async (req, res) => {
  const { account } = req.body;
  const acc = await Account.findById(account);

  if (
    !acc.users
      .map((u) => u.user._id.toString())
      .includes(req.user._id.toString())
  ) {
    return res.status(405).json({
      status: 'Not allowed',
    });
  }
  const newPayment = await Payment.create({ ...req.body, user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: newPayment,
  });
});
export const updatePayment = catchAsync(async (req, res) => {
  const updatedPayment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    data: updatedPayment,
  });
});
