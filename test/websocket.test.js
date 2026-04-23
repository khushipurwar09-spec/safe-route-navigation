const { io } = require('socket.io-client');

describe('WebSocket Connection', () => {
  let clientSocket;

  beforeAll((done) => {
    // Ensure backend is running locally on 3000 before running tests
    clientSocket = io('http://localhost:3000');
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.close();
  });

  it('should connect to the server', () => {
    expect(clientSocket.connected).toBe(true);
  });
});
