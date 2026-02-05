import request from 'supertest';
import app from '../src/app.js';

describe('User Endpoints', () => {
  describe('GET /users', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });
  });
});
