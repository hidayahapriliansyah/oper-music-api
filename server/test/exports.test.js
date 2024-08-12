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
  deleteAllSongs,
  deleteAllPlaylistActivities,
  getSong,
  createSongWithPerformerJKT48,
  addSongToPlaylist,
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

describe('POST /exports/:playlistId', () => {
  let accessTokenJohn;
  let accessTokenDoe;
  let playlistId;
  let songId;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();

    const doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);
    accessTokenDoe = createAccessTokenByUserId(doeUserId);

    playlistId = await createPlaylistJohn();
    songId = await createSongWithPerformerJKT48();
    await addSongToPlaylist(playlistId, songId);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
    await deleteAllSongs();
    await deleteAllPlaylistActivities();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .post(`/export/playlists/${playlistId}`)
      .send({});

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .post(`/export/playlists/${playlistId}`)
      .set('Authorization', 'Bearer wrong-token')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .post('/export/playlists/wrong-playlistid')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        targetEmail: 'adimuhamadfirmansyah@gmail.com',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should error if payload body is invalid', async () => {
    const response = await supertest(server.listener)
      .post(`/export/playlists/${playlistId}`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        targetEmai: 'adimuhamadfirmansyah@gmail.com',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error unauthorized if user is not owner of playlist', async () => {
    const response = await supertest(server.listener)
      .post(`/export/playlists/${playlistId}`)
      .set('Authorization', `Bearer ${accessTokenDoe}`)
      .send({
        targetEmail: 'adimuhamadfirmansyah@gmail.com',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success and giver correct response', async () => {
    const response = await supertest(server.listener)
      .post(`/export/playlists/${playlistId}`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        targetEmail: 'adimuhamadfirmansyah@gmail.com',
      });

    const songs = await getSong();
    console.log('songs =>', songs);

    console.log('response.body', response.body);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  }, 10000);
});
