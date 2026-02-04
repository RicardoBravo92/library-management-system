import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination.js';

export const getUsers = async (req: Request, res: Response) => {    
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { email, name } = req.query;



    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          email: {
            contains: email as string,
          },
          name: {
            contains: name as string,
          },
        },
        select: { id: true, email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ 
        where: {
          email: {
            contains: email as string,
          },
          name: {
            contains: name as string,
          },
        } 
       }),
    ]);

    const response = buildPaginatedResponse(users, total, {
      page,
      limit,
      skip,
    });
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

