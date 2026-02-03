import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong on the server';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let details: any = undefined;

  // 1. Handle Custom Errors (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code || 'APP_ERROR';
  }
  // 2. Handle Validation Errors (Zod)
  else if (err instanceof z.ZodError) {
    statusCode = 400;
    message = 'Data validation error';
    errorCode = 'VALIDATION_ERROR';
    details = err.issues.map((e: z.ZodIssue) => ({
      field: e.path.length > 0 ? e.path.join('.') : 'body',
      message: e.message
    }));
  }
  // 3. Handle Database Errors (Prisma)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with these details already exists';
      errorCode = 'DUPLICATE_ENTRY';
      details = { target: err.meta?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested resource does not exist';
      errorCode = 'NOT_FOUND';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Relationship error: parent record does not exist';
      errorCode = 'FOREIGN_KEY_FAILED';
    } else {
      message = 'Database error';
      errorCode = `PRISMA_${err.code}`;
    }
  } 
  // 4. Handle Authentication Errors (JWT)
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  // 5. Default Errors
  else {
    message = err.message;
  }

  // Professional logging
  console.error(`[${new Date().toISOString()}] [${errorCode}] ${req.method} ${req.path}:`, err);

  // Clean professional response (no stack trace)
  res.status(statusCode).json({
    success: false,
    status: 'error',
    code: errorCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  });
};
