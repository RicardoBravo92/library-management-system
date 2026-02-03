import prisma from '../config/prisma.js';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../utils/AppError.js';
import { PaginationParams, PaginatedResponse, buildPaginatedResponse } from '../utils/pagination.js';

const authorSchema = z.object({
  name: z.string().min(1),
  nationality: z.string().optional(),
});

export const updateAuthorBookCount = async (authorId: number) => {
  const count = await prisma.book.count({
    where: { authorId },
  });

  await prisma.author.update({
    where: { id: authorId },
    data: { bookCount: count },
  });
};

export const createNewAuthor = async (data: unknown) => {
  const validatedData = authorSchema.parse(data);
  return await prisma.author.create({ data: validatedData });
};

export const getAllAuthors = async (
  params: PaginationParams, 
  filters: { name?: string; nationality?: string }
): Promise<PaginatedResponse<any>> => {
  const { page, limit, skip } = params;
  const { name, nationality } = filters;
  
  const where: Prisma.AuthorWhereInput = {};

  if (name && name.trim()) {
    where.name = { contains: name.trim() };
  }
  if (nationality && nationality.trim()) {
    where.nationality = { contains: nationality.trim() };
  }

  const [authors, total] = await Promise.all([
    prisma.author.findMany({
      where,
      include: { books: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.author.count({ where }),
  ]);

  return buildPaginatedResponse(authors, total, { page, limit, skip });
};

export const getAuthorDetail = async (id: number) => {
  if (isNaN(id)) throw new AppError('Invalid author ID', 400, 'INVALID_AUTHOR_ID');

  const author = await prisma.author.findUnique({
    where: { id },
    include: { books: true },
  });

  if (!author) throw new AppError('Author not found', 404, 'AUTHOR_NOT_FOUND');
  return author;
};

export const updateAuthorDetail = async (id: number, data: unknown) => {
  if (isNaN(id)) throw new AppError('Invalid author ID', 400);

  const existingAuthor = await prisma.author.findUnique({ where: { id } });
  if (!existingAuthor) throw new AppError('Author not found', 404, 'AUTHOR_NOT_FOUND');

  const validatedData = authorSchema.partial().parse(data);
  
  return await prisma.author.update({
    where: { id },
    data: validatedData,
  });
};

export const deleteAuthorById = async (id: number) => {
  if (isNaN(id)) throw new AppError('Invalid author ID', 400);

  const existingAuthor = await prisma.author.findUnique({
    where: { id },
    include: { books: true },
  });

  if (!existingAuthor) throw new AppError('Author not found', 404);

  if (existingAuthor.books.length > 0) {
    throw new AppError(`Cannot delete author with associated books. Books count: ${existingAuthor.books.length}`, 400, 'AUTHOR_HAS_BOOKS');
  }

  await prisma.author.delete({ where: { id } });
};
