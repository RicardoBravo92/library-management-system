import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';
import { 
  createNewAuthor, 
  getAllAuthors, 
  getAuthorDetail, 
  updateAuthorDetail, 
  deleteAuthorById 
} from '../services/author.service.js';

export const createAuthor = asyncHandler(async (req: Request, res: Response) => {
  const author = await createNewAuthor(req.body);
  res.status(201).json({
    message: 'Author created successfully',
    data: author,
  });
});

export const getAuthors = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = getPaginationParams(req);
  const filters = {
    name: req.query.name as string,
    nationality: req.query.nationality as string,
  };

  const response = await getAllAuthors(paginationParams, filters);
  res.status(200).json(response);
});

export const getAuthorById = asyncHandler(async (req: Request, res: Response) => {
  const author = await getAuthorDetail(parseInt(req.params.id));
  res.status(200).json(author);
});

export const updateAuthor = asyncHandler(async (req: Request, res: Response) => {
  const author = await updateAuthorDetail(parseInt(req.params.id), req.body);
  res.status(200).json({
    message: 'Author updated successfully',
    data: author,
  });
});

export const deleteAuthor = asyncHandler(async (req: Request, res: Response) => {
  await deleteAuthorById(parseInt(req.params.id));
  res.status(200).json({ message: 'Author deleted successfully' });
});


