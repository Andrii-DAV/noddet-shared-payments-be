import mongoose from 'mongoose';
import Payment, { IPayment } from './paymentModel';

export interface IAccount {
  name: string;
  type: string;
  createdAd: Date;
  owner: mongoose.Schema.Types.ObjectId;
  payments: IPayment[];
  users: {
    user: mongoose.Schema.Types.ObjectId;
    contribution: number;
    _id: mongoose.Schema.Types.ObjectId;
  }[];
}
const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Owner is required'],
      ref: 'User',
    },
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        contribution: Number,
        debt: Number,
      },
    ],
    type: {
      type: String,
      enum: ['shared-payments', 'savings'],
      default: 'shared-payments',
    },
    createdAd: {
      type: Date,
      default: Date.now(),
    },
    total: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
accountSchema.pre('save', function (next) {
  if (this.isModified('total')) {
    this.invalidate('total', 'You cannot update the total field');
  }
  next();
});
accountSchema.methods.getStatistics = async function () {
  const payments = await Payment.aggregate([
    { $match: { account: this._id } },
    {
      $group: { _id: '$account', totalAmount: { $sum: '$amount' } },
    },
  ]);

  const total = payments[0]?.totalAmount;
  const divided = total / this.users.length;

  const usersDebts = {};

  (this as any).users.map((u) => {
    const debt = divided - u.contribution;

    usersDebts[u.id] = {
      debt: debt <= 0 ? 0 : debt,
    };
  });

  return { usersDebts, total };
};

accountSchema.pre(/^find/, function (next) {
  (this as any).populate({ path: 'users.user', select: '-__v -role' });
  next();
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
