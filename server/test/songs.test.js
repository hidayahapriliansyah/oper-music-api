// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  createAlbum,
  closePool,
  deleteAllAlbums,
  deleteAllSongs,
  getAlbum,
  createSong,
  getSong,
  createSongWithPerformerJKT48,
  // getSong,
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

describe('POST /songs', () => {
  beforeEach(async () => {
    await createAlbum({ name: 'Test Album', year: 2021 });
  });

  afterEach(async () => {
    await deleteAllSongs();
    await deleteAllAlbums();
  });

  it('should response error if payload is invalid', async () => {
    const response = await supertest(server.listener)
      .post('/songs')
      .send({
        title: 21212,
        year: 'test',
        genre: 'test',
        performer: 'test',
        duration: 'test',
        albumId: 'sdfsdf',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should give status 201', async () => {
    const { id: albumId } = getAlbum();

    const response = await supertest(server.listener)
      .post('/songs')
      .send({
        title: 'Test',
        year: 2000,
        genre: 'Test',
        performer: 'Test',
        duration: 2000,
        albumId,
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.songId).toBeDefined();
  });
});

describe('GET /songs', () => {
  beforeEach(async () => {
    const albumId = await createAlbum({ name: 'Test Album', year: 2021 });
    await createSong(albumId);
    await createSongWithPerformerJKT48();
  });

  afterEach(async () => {
    await deleteAllSongs();
    await deleteAllAlbums();
  });

  it('should response with data songs', async () => {
    const response = await supertest(server.listener)
      .get('/songs');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.songs.length).toBe(2);
    expect(response.body.data.songs[0].id).toBeDefined();
    expect(response.body.data.songs[0].title).toBeDefined();
    expect(response.body.data.songs[0].performer).toBeDefined();
  });

  it('should response with query title', async () => {
    const response = await supertest(server.listener)
      .get('/songs')
      .query({
        title: 'Heav',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.songs.length).toBe(1);
    expect(Object.keys(response.body.data.songs[0]).length).toBe(3);
    expect(response.body.data.songs[0].id).toBeDefined();
    expect(response.body.data.songs[0].title).toBe('Heavy Rotation');
    expect(response.body.data.songs[0].performer).toBe('JKT48');
  });

  it('should response with query performer', async () => {
    const response = await supertest(server.listener)
      .get('/songs')
      .query({
        performer: '48',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.songs.length).toBe(1);
    expect(Object.keys(response.body.data.songs[0]).length).toBe(3);
    expect(response.body.data.songs[0].id).toBeDefined();
    expect(response.body.data.songs[0].title).toBe('Heavy Rotation');
    expect(response.body.data.songs[0].performer).toBe('JKT48');
  });

  it('should response with query title and performer', async () => {
    const response = await supertest(server.listener)
      .get('/songs')
      .query({
        title: 'Rota',
        performer: '48',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.songs.length).toBe(1);
    expect(Object.keys(response.body.data.songs[0]).length).toBe(3);
    expect(response.body.data.songs[0].id).toBeDefined();
    expect(response.body.data.songs[0].title).toBe('Heavy Rotation');
    expect(response.body.data.songs[0].performer).toBe('JKT48');
  });
});

describe('GET /songs/:songId', () => {
  let songId;

  beforeEach(async () => {
    const albumId = await createAlbum({ name: 'Test Album', year: 2021 });
    songId = await createSong(albumId);
  });

  afterEach(async () => {
    await deleteAllSongs();
    await deleteAllAlbums();
  });

  it('should response error not found', async () => {
    const response = await supertest(server.listener)
      .get('/songs/id-ngaco');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should response success with song', async () => {
    const response = await supertest(server.listener)
      .get(`/songs/${songId}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.song.id).toBeDefined();
    expect(response.body.data.song.title).toBeDefined();
    expect(response.body.data.song.year).toBeDefined();
    expect(response.body.data.song.genre).toBeDefined();
    expect(response.body.data.song.performer).toBeDefined();
    expect(response.body.data.song.duration).toBeDefined();
    expect(response.body.data.song.album_id).toBeDefined();
  });
});

describe('PUT /songs/:songId', () => {
  let songId;

  beforeEach(async () => {
    const albumId = await createAlbum({ name: 'Test Album', year: 2021 });
    songId = await createSong(albumId);
  });

  afterEach(async () => {
    await deleteAllSongs();
    await deleteAllAlbums();
  });

  it('should response error not found', async () => {
    const response = await supertest(server.listener)
      .put('/songs/id-ngaco')
      .send({
        title: 'Test',
        year: 2000,
        genre: 'Test',
        performer: 'Test',
      });

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should response error validation', async () => {
    const response = await supertest(server.listener)
      .put(`/songs/${songId}`)
      .send({
        title: 21212,
        year: 'test',
        genre: 'test',
        performer: 'test',
        duration: 'test',
        albumId: 'sdfsdf',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should response success', async () => {
    const response = await supertest(server.listener)
      .put(`/songs/${songId}`)
      .send({
        title: 'Test',
        year: 2000,
        genre: 'Test',
        performer: 'Test',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});

describe('DELETE /songs/:songId', () => {
  let songId;

  beforeEach(async () => {
    const albumId = await createAlbum({ name: 'Test Album', year: 2021 });
    songId = await createSong(albumId);
  });

  afterEach(async () => {
    await deleteAllSongs();
    await deleteAllAlbums();
  });

  it('should response error not found', async () => {
    const response = await supertest(server.listener)
      .delete('/songs/id-ngaco');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should response success', async () => {
    const response = await supertest(server.listener)
      .delete(`/songs/${songId}`);

    const dbsong = await getSong();

    expect(dbsong).toBeUndefined();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});
