import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Client } from '../models/Client';

interface ClientJwtPayload {
  id: string;
  email: string;
  type: 'client';
  lawFirmId: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      client?: any;
    }
  }
}

export const clientAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as ClientJwtPayload;

    // Verify it's a client token
    if (decoded.type !== 'client') {
      res.status(401).json({
        success: false,
        message: 'Invalid token type. Client access required.',
      });
      return;
    }

    // Verify client still exists
    const client = await Client.findById(decoded.id);
    if (!client) {
      res.status(401).json({
        success: false,
        message: 'Client not found.',
      });
      return;
    }

    // Add client info to request
    req.user = {
      id: client._id,
      email: client.email,
      type: 'client',
      lawFirmId: client.lawFirmId,
    };
    req.client = client;

    next();
  } catch (error) {
    console.error('Client auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

