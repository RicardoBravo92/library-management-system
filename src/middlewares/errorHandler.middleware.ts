import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // 1. Handle Trusted Custom Errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. Handle Zod Validation Errors
  else if (err instanceof z.ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = (err as any).errors;
  }
  // 3. Handle Prisma Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate field value entered';
      details = err.meta;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Foreign key constraint failed';
      details = err.meta;
    } else {
      message = `Database Error: ${err.message}`;
    }
  } 
  // 4. Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // 5. Default Error
  else {
    message = err.message || message;
  }

  console.error(`[Error] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
