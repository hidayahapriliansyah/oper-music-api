// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  closePool,
  createUser,
  deleteAllUsers,
  getUserByUsername,
} = require('./utils');

let server;

beforeAll(async () => {
  server = await createServer();
  await server.start();
});

afterAll(async () => {
  await server.stop();
  await closePool();
});

describe('POST /users', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await deleteAllUsers();
  });

  it('should response error conflict username', async () => {
    const response = await supertest(server.listener)
      .post('/users')
      .send({
        username: 'test_username',
        fullname: 'hello',
        password: 'rahasia',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if body payload is invalid', async () => {
    const response = await supertest(server.listener)
      .post('/users')
      .send({
        username: 'test_username',
        fullname: 'hello',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success adding user', async () => {
    const response = await supertest(server.listener)
      .post('/users')
      .send({
        username: 'new_username',
        fullname: 'Full Name',
        password: 'rahasia',
      });

    const dbUser = await getUserByUsername('new_username');
    expect(dbUser.password).toBeDefined();
    expect(dbUser.password !== 'rahasia').toBe(true);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.userId).toBeDefined();
  });
});
