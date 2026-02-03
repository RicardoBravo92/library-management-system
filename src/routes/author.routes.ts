import { Router } from 'express';
import { createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor } from '../controllers/author.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors (con paginación y filtros)
 *     tags: [Authors]
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
 *         name: name
 *         schema: { type: string }
 *         description: Filtrar por nombre (contiene)
 *       - in: query
 *         name: nationality
 *         schema: { type: string }
 *         description: Filtrar por nacionalidad (contiene)
 *     responses:
 *       200:
 *         description: Lista paginada de autores con data y pagination
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               nationality: { type: string }
 *     responses:
 *       201: { description: Author created }
 *       400: { description: Validation error }
 */
router.get('/', getAuthors);
router.get('/:id', getAuthorById);
router.post('/', createAuthor);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Authors]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Author details }
 *       404: { description: Author not found }
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
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
 *               name: { type: string }
 *               nationality: { type: string }
 *     responses:
 *       200: { description: Author updated }
 *       404: { description: Author not found }
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Author deleted }
 *       404: { description: Author not found }
 *       400: { description: Author has associated books }
 */

export default router;
