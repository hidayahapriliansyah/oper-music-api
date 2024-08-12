// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  closePool,
  createUser,
  deleteAllUsers,
  createUserThenGetRefreshToken,
  deleteAllRefreshToken,
  getAuthFromDb,
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

describe('POST /authentications', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await deleteAllUsers();
  });

  it('should response error if username or password is invalid', async () => {
    const response = await supertest(server.listener)
      .post('/authentications')
      .send({
        username: 'test_username',
        password: 'wrong_password',
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if payload schema is invalid', async () => {
    const response = await supertest(server.listener)
      .post('/authentications')
      .send({
        username: 'test_username',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success and respons with access and refresh token', async () => {
    const response = await supertest(server.listener)
      .post('/authentications')
      .send({
        username: 'test_username',
        password: 'rahasia',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });
});

describe('PUT /authentications', () => {
  let refreshToken;

  beforeEach(async () => {
    refreshToken = await createUserThenGetRefreshToken();
  });

  afterEach(async () => {
    await deleteAllRefreshToken();
    await deleteAllUsers();
  });

  it('should response error if request body schema is invalid', async () => {
    const response = await supertest(server.listener)
      .put('/authentications')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if refresh token is invalid', async () => {
    const response = await supertest(server.listener)
      .put('/authentications')
      .send({
        refreshToken: 'wrong refresh token',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success and give access token', async () => {
    const response = await supertest(server.listener)
      .put('/authentications')
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
  });
});

describe('PUT /authentications', () => {
  let refreshToken;

  beforeEach(async () => {
    refreshToken = await createUserThenGetRefreshToken();
  });

  afterEach(async () => {
    await deleteAllRefreshToken();
    await deleteAllUsers();
  });

  it('should response error if request body schema is invalid', async () => {
    const response = await supertest(server.listener)
      .delete('/authentications')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if refresh token is invalid', async () => {
    const response = await supertest(server.listener)
      .delete('/authentications')
      .send({
        refreshToken: 'wrong refresh token',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success delete refresh token', async () => {
    const response = await supertest(server.listener)
      .delete('/authentications')
      .send({
        refreshToken,
      });

    const dbRefreshToken = await getAuthFromDb();
    expect(dbRefreshToken).toBe(undefined);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});
