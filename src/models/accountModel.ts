import mongoose from 'mongoose';

export interface IAccount {
  name: string;
  type: string;
  createdAd: Date;
  owner: mongoose.Schema.Types.ObjectId;
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

accountSchema.virtual('payments', {
  ref: 'Payment',
  foreignField: 'account',
  localField: '_id',
});

accountSchema.pre(/^find/, function (next) {
  (this as any)
    .populate({ path: 'users.user', select: '-__v -role' })
    .populate({ path: 'payments', select: '-__v' });
  next();
});
accountSchema.virtual('total').get(function () {
  return (this as any).payments.reduce(
    (payment, curr) => payment + curr.amount,
    0,
  );
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
