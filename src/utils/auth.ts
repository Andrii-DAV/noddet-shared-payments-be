import jwt, { JwtPayload } from 'jsonwebtoken';
import { MongooseId } from '../models/userModel';
import express from 'express';

export const signToken = (id: MongooseId) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export async function jwtVerify(
  token: string,
  secret: string,
): Promise<string | JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

export const getHeaderToken = (req: express.Request) => {
  const { headers } = req;
  let token;
  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  return token;
};
export const isAuthenticated = (req: express.Request) =>
  Boolean(getHeaderToken(req));
