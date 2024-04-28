import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import authRouter from './routes/authRouter';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter';
import cors from 'cors';
import paymentRouter from './routes/paymentRouter';
import accountsRouter from './routes/accountsRouter';

dotenv.config({ path: './.env' });

const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL as string).then(({ connection }) => {
  console.log(
    `Connected to ${connection.name.toUpperCase()} Collection successfully!`,
  );
});

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(cookieParser());
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use('/api/v1/users', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/accounts', accountsRouter);

app.use((err, req, res, next) => {
  res.status(err?.statusCode || 500).json({
    status: err?.statusCode || 500,
    message: err?.message || 'Something went wrong',
    err: err,
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.PORT}`);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
