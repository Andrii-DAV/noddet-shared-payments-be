import mongoose from 'mongoose';
import Account from './accountModel';
import { MongooseId } from './userModel';

export interface IPayment {
  user: MongooseId;
  account: MongooseId;
  tags: string[];
  date: Date;
  currency: string;
  amount: number;
  type: number;
}
const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account is required'],
  },
  tags: {
    type: [String],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  currency: {
    type: String,
    default: 'UAH',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required.'],
  },
  type: {
    type: String,
    enum: ['payment', 'reimbursement'],
    default: 'payment',
  },
});

paymentSchema.statics.calcUserContribution = async function (
  account: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
) {
  //curr model
  const contribution = await this.aggregate([
    {
      $match: { account, user: userId },
    },
    {
      $group: {
        _id: '$account',
        contribution: { $sum: '$amount' },
      },
    },
  ]);

  const accountToUpd = await Account.findById(account);

  (accountToUpd as any).users = accountToUpd.users.map((u) => {
    return u.user._id.toString() === userId.toString()
      ? { ...u, contribution: contribution[0].contribution }
      : u;
  });
  await accountToUpd.save();
};

paymentSchema.post('save', function () {
  //this -> document
  //this.constructor -> model
  //@ts-ignore
  this.constructor.calcUserContribution(this.account, this.user);
});

paymentSchema.pre(/^find/, function (next) {
  (this as any).populate({ path: 'user', select: '-role -__v' });
  next();
});
const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
