import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import authorRoutes from './author.routes.js';
import bookRoutes from './book.routes.js';
import exportRoutes from './export.routes.js';

const router = Router();
const apiV1 = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check system health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
apiV1.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

apiV1.use('/auth', authRoutes);
apiV1.use('/users', userRoutes);
apiV1.use('/authors', authorRoutes);
apiV1.use('/books', bookRoutes);
apiV1.use('/export', exportRoutes);

router.use('/api/v1', apiV1);

export default router;
