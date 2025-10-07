const jwt = require('jsonwebtoken');
import { config } from '../config';

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};