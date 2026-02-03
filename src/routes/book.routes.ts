import { Router } from 'express';
import { createBook, getBooks, getBookById, updateBook, deleteBook } from '../controllers/book.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books (con paginación y filtros)
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página (máx 100)
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *         description: Filtrar por título (contiene)
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filtrar por género (contiene)
 *       - in: query
 *         name: authorId
 *         schema: { type: integer }
 *         description: Filtrar por ID de autor
 *     responses:
 *       200:
 *         description: Lista paginada de libros
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, authorId]
 *             properties:
 *               title: { type: string }
 *               genre: { type: string }
 *               authorId: { type: integer }
 *     responses:
 *       201: { description: Book created }
 *       400: { description: Validation error }
 *       404: { description: Author not found }
 */
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Book details }
 *       404: { description: Book not found }
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               genre: { type: string }
 *               authorId: { type: integer }
 *     responses:
 *       200: { description: Book updated }
 *       404: { description: Book not found }
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Book deleted }
 *       404: { description: Book not found }
 */

export default router;
