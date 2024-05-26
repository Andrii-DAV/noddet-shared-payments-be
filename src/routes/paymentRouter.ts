import express from 'express';
import { protect } from '../controllers/authController';
import {
  addPayment,
  deletePayment,
  getAllPayments,
  updatePayment,
} from '../controllers/paymentController';

const paymentRouter = express();

paymentRouter.use(protect);
paymentRouter.route('/').get(getAllPayments).post(addPayment);
paymentRouter.route('/:id').patch(updatePayment).delete(deletePayment);

export default paymentRouter;
