import prisma from '../config/prisma.js';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { PaginationParams, PaginatedResponse, buildPaginatedResponse } from '../utils/pagination.js';
import eventEmitter from '../utils/events.js';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  genre: z.string().optional(),
  authorId: z.number({ message: 'Author ID must be a number' }).min(1, 'Author ID is required'),
});

export const createNewBook = async (data: unknown) => {
  const validatedData = bookSchema.parse(data);
  
  const author = await prisma.author.findUnique({
    where: { id: validatedData.authorId },
  });

  if (!author) {
    throw new AppError('Author not found', 404, 'AUTHOR_NOT_FOUND');
  }

  const book = await prisma.book.create({ data: validatedData });

  eventEmitter.emit('book.changed', validatedData.authorId);

  return book;
};

export const getAllBooks = async (
  params: PaginationParams,
  filters: { title?: string; genre?: string; authorId?: number }
): Promise<PaginatedResponse<any>> => {
  const { page, limit, skip } = params;
  const { title, genre, authorId } = filters;

  const where: Prisma.BookWhereInput = {};

  if (title && title.trim()) where.title = { contains: title.trim() };
  if (genre && genre.trim()) where.genre = { contains: genre.trim() };
  if (authorId) where.authorId = authorId;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  return buildPaginatedResponse(books, total, { page, limit, skip });
};

export const getBookDetail = async (id: number) => {
  if (isNaN(id)) throw new AppError('Invalid book ID', 400, 'INVALID_BOOK_ID');

  const book = await prisma.book.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!book) throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');
  return book;
};

export const updateBookDetail = async (id: number, data: unknown) => {
  if (isNaN(id)) throw new AppError('Invalid book ID', 400);

  const existingBook = await prisma.book.findUnique({ where: { id } });
  if (!existingBook) throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');

  const validatedData = bookSchema.partial().parse(data);

  if (validatedData.authorId && validatedData.authorId !== existingBook.authorId) {
    const author = await prisma.author.findUnique({
      where: { id: validatedData.authorId },
    });
    if (!author) throw new AppError('Author not found', 404, 'AUTHOR_NOT_FOUND');
  }

  const book = await prisma.book.update({
    where: { id },
    data: validatedData,
  });

  if (validatedData.authorId) {
    eventEmitter.emit('book.changed', validatedData.authorId);
    if (validatedData.authorId !== existingBook.authorId) {
      eventEmitter.emit('book.changed', existingBook.authorId);
    }
  }

  return book;
};

export const deleteBookById = async (id: number) => {
  if (isNaN(id)) throw new AppError('Invalid book ID', 400, 'INVALID_BOOK_ID');

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError('Book not found', 404);

  await prisma.book.delete({ where: { id } });
  
  eventEmitter.emit('book.changed', book.authorId);
};

