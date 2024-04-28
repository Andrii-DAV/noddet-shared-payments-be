import express from 'express';
import { protect } from '../controllers/authController';
import { userProfile } from '../controllers/userController';

const userRouter = express.Router();

userRouter.use(protect);

userRouter.get('/profile', userProfile);

export default userRouter;
