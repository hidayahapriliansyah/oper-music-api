// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  closePool,
  createUserJohn,
  createUserDoe,
  createAccessTokenByUserId,
  createPlaylistJohn,
  deleteAllUsers,
  deleteAllPlaylists,
  deleteAllCollaborations,
  getOneCollaborations,
  addCollaborator,
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

describe('POST /collaborations', () => {
  let accessTokenJohn;
  let playlistId;
  let johnUserId;
  let doeUserId;

  beforeEach(async () => {
    johnUserId = await createUserJohn();

    doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);

    playlistId = await createPlaylistJohn();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
    await deleteAllCollaborations();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .send({
        userId: doeUserId,
        playlistId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .set('Authorization', 'Bearer wrong-token')
      .send({
        userId: doeUserId,
        playlistId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: doeUserId,
        playlistId: 'random playlist id',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should error if user id is not found', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: 'random-user-id',
        playlistId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('User yang akan ditambahkan tidak ada');
  });

  it('should error if owner added it\'s own user id', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: johnUserId,
        playlistId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Anda tidak berhak mengakses resource ini');
  });

  it('should success add user as collaborator', async () => {
    const response = await supertest(server.listener)
      .post('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: doeUserId,
        playlistId,
      });

    const dbCollab = await getOneCollaborations();
    expect(dbCollab.id).toBeDefined();

    console.log('response.body', response.body);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.collaborationId).toBeDefined();
  });
});

describe('DELETE /collaborations', () => {
  let accessTokenJohn;
  let playlistId;
  let johnUserId;
  let doeUserId;

  beforeEach(async () => {
    johnUserId = await createUserJohn();

    doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);

    playlistId = await createPlaylistJohn();

    await addCollaborator(doeUserId, playlistId);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
    await deleteAllCollaborations();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .send({
        userId: doeUserId,
        playlistId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .set('Authorization', 'Bearer wrong-token')
      .send({
        userId: doeUserId,
        playlistId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: doeUserId,
        playlistId: 'random playlist id',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should error if user id is not found', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: 'random-user-id',
        playlistId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('User yang akan ditambahkan tidak ada');
  });

  it('should error if owner added it\'s own user id', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: johnUserId,
        playlistId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Anda tidak berhak mengakses resource ini');
  });

  it('should success delete user from collaborators', async () => {
    const response = await supertest(server.listener)
      .delete('/collaborations')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        userId: doeUserId,
        playlistId,
      });

    const dbCollab = await getOneCollaborations();
    expect(dbCollab).toBe(undefined);

    console.log('response.body', response.body);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});
