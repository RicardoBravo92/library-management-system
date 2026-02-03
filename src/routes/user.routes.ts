import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (con paginación y filtros)
 *     tags: [Users]
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
 *         name: email
 *         schema: { type: string }
 *         description: Filtrar por email (contiene)
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filtrar por nombre (contiene)
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 */
router.get('/', getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id', getUserById);

export default router;
