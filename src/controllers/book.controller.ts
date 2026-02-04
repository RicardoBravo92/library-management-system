import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';
import {
  createNewBook,
  getAllBooks,
  getBookDetail,
  updateBookDetail,
  deleteBookById
} from '../services/book.service.js';

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await createNewBook(req.body);
  res.status(201).json({
    message: 'Book created successfully',
    data: book,
  });
});

export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = getPaginationParams(req);
  const filters = {
    title: req.query.title as string,
    genre: req.query.genre as string,
    authorId: req.query.authorId ? parseInt(req.query.authorId as string) : undefined,
  };

  const response = await getAllBooks(paginationParams, filters);
  res.status(200).json(response);
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const book = await getBookDetail(parseInt(req.params.id));
  res.status(200).json(book);
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await updateBookDetail(parseInt(req.params.id), req.body);
  res.status(200).json({
    message: 'Book updated successfully',
    data: book,
  });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  await deleteBookById(parseInt(req.params.id));
  res.status(200).json({ message: 'Book deleted successfully' });
});


