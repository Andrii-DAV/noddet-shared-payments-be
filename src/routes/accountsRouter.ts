import express from 'express';
import {
  createAccount,
  getAccounts,
  getCurrentAccInfo,
  inviteUser,
} from '../controllers/accountsController';
import { protect } from '../controllers/authController';

const accountsRouter = express.Router();

accountsRouter.use(protect);
accountsRouter.route('/').get(getAccounts).post(createAccount);
accountsRouter.route('/:id').get(getCurrentAccInfo);
accountsRouter.route('/:id/invite').patch(inviteUser);

export default accountsRouter;
