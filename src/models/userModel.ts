import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

type UserRole = 'user' | 'admin';
export type MongooseId = mongoose.Types.ObjectId;

export interface IUser {
  _id: MongooseId;
  email: string;
  password: string;
  confirmPassword: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
}

interface IUserMethods {
  fullName(): string;
  comparePasswords(
    passwordToCompare: string,
    activePassword: string,
  ): Promise<boolean>;
}
type UserModel = Model<IUser, NonNullable<unknown>, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Please provide a valid email address.'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
      validate: {
        validator: (pass: string) =>
          validator.isStrongPassword(pass, {
            minLength: 8,
            minUppercase: 1,
            minLowercase: 0,
            minNumbers: 0,
            minSymbols: 0,
          }),
        message:
          'Password must be at least 8 characters and contain at least 1 uppercase letter.',
      },
      required: [true, 'Please provide the password field.'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide the confirmPassword field.'],
      select: false,
      validate: {
        validator: function (val: string) {
          return Boolean(val === this.password);
        },
        message: "Passwords don't match",
      },
    },
    first_name: String,
    last_name: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.comparePasswords = async function (
  passwordToCompare,
  activePassword,
) {
  return await bcrypt.compare(activePassword, passwordToCompare);
};

// userSchema.virtual('accounts_owner', {
//   ref: 'Account',
//   foreignField: 'owner',
//   localField: '_id',
//   select: 'name _id -payments',
// });

// userSchema.virtual('accounts_guest', {
//   ref: 'Account',
//   foreignField: 'users',
//   localField: '_id',
// });
//

const User = mongoose.model('User', userSchema);

export default User;
