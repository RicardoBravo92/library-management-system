import { Router } from 'express';
import { exportData } from '../controllers/export.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /export:
 *   get:
 *     summary: Export authors and books data to Excel (XLSX)
 *     tags: [Export]
 *     security: [{ bearerAuth: [] }]
 *     description: Generates an Excel file with two sheets - one for authors and one for books
 *     responses:
 *       200:
 *         description: Excel file downloaded successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error generating export file
 */
router.get('/', exportData);

export default router;

