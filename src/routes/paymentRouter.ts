import express from 'express';
import { protect } from '../controllers/authController';
import { addPayment, getAllPayments } from '../controllers/paymentController';

const paymentRouter = express();

paymentRouter.use(protect);
paymentRouter.route('/').get(getAllPayments).post(addPayment);

export default paymentRouter;
