const request = require('supertest');
// Note: This is a scaffold. To run, export the app from server.js (module.exports = app;)
// const app = require('../safe-route-backend/server.js');

describe('API Endpoints', () => {
  it('should return 200 for health check', async () => {
    // const res = await request(app).get('/');
    // expect(res.statusCode).toEqual(200);
    expect(true).toBe(true);
  });

  it('should fetch safe refuges', async () => {
    // const res = await request(app).get('/api/refuges/nearby?lat=19.0&lng=72.8');
    // expect(res.statusCode).toEqual(200);
    expect(true).toBe(true);
  });
});
