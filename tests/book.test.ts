import request from 'supertest';
import app from '../src/app.js';

describe('Book Endpoints', () => {
  describe('GET /books', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/books');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /books', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/books')
        .send({ title: 'New Book', authorId: 1 });
      expect(res.status).toBe(401);
    });
  });
});
